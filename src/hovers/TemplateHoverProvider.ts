import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import * as osLocale from 'os-locale';
import { isSupportedDocument } from '../utils/document';
import { recordPageView } from '../utils/visitor';
import { ASTNode } from '../parser/ASTNode';
import { buildAstRecursively, getNodeFromOffset } from '../parser/parser';
import { JSONSchemaService } from '../language-service/services/jsonSchemaService';
import { ValidationResult, SchemaCollector } from '../language-service/parser/jsonParser';
import { PropertyASTNode } from '../parser/PropertyASTNode';
import { JSONSchema } from '../language-service/jsonSchema';
import * as cronParser from 'cron-parser';
const cronstrue = require('cronstrue/i18n');
const jstz = require('jstimezonedetect')

export class TemplateHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Hover> {
    if (!isSupportedDocument(document)) {
      return;
    }
    recordPageView('/templateHover');
    return this.doHover(document, position);
  }

  private parse(text: string): ASTNode {
    return buildAstRecursively(undefined, Yaml.load(text));;
  }

  private async doHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Hover | undefined> {
    const docRoot = this.parse(document.getText());
    const node = getNodeFromOffset(docRoot, document.offsetAt(position));
    if (!node) {
      return;
    }
    const jsonSchemaService = JSONSchemaService.getJSONSchemaService();
    const resolvedSchema = await jsonSchemaService.getSchemaForResource();
    // 此处之所以做非空校验是因为 getSchemaForResource 方法的返回值标记了有可能返回 void
    // 目前并不会有得不到 schema 的情况
    if (!resolvedSchema) {
      return;
    }
    const validationResult = new ValidationResult();
    const matchingSchemas = new SchemaCollector(undefined, undefined);
    let schema: JSONSchema | undefined;
    docRoot.validate(resolvedSchema.schema, validationResult, matchingSchemas);
    let isCron: boolean = false;
    matchingSchemas.schemas.forEach(applicableSchema => {
      const parentNode = applicableSchema.node.parent;
      if (!parentNode || parentNode.type !== 'property') {
        return;
      }
      const propertyNode = parentNode as PropertyASTNode;
      if (propertyNode.key.value === 'CronExpression'
        && propertyNode.value && propertyNode.value.contains(document.offsetAt(position))
      ) {
        isCron = true;
        return;
      }
      if (!propertyNode.key.contains(document.offsetAt(position))) {
        return;
      }
      if (propertyNode.key.value === node.getValue()) {
        schema = applicableSchema.schema;
      }
    });
    const hoverRange = new vscode.Range(
      document.positionAt(node.start),
      document.positionAt(node.end),
    );
    if (isCron) {
      const readableDescription = getCronReadableDesription(node.getValue());
      if (readableDescription) {
        return new vscode.Hover(
          readableDescription,
          hoverRange,
        )
      }
      return;
    }
    if (!schema) {
      return;
    }
    const markdown = getSchemaDoc(schema);
    if (markdown) {
      return new vscode.Hover(
        [markdown],
        hoverRange,
      );
    }
  }
}

function getSchemaDoc(schema: JSONSchema): string | undefined {
  if (!schema.properties) {
    return;
  }
  let properties = '';
  Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
    let types: string[] = [];
    if (!propertySchema.type) {
      if (propertySchema.oneOf) {
        propertySchema.oneOf.forEach(singleSchema => {
          if (singleSchema.type) {
            types.push(singleSchema.type as string);
          }
        })
      }
    } else {
      types.push(propertySchema.type as string);
    }
    properties += `| \`${propertyName}\` | ${types.join()} |\n`;
  });
  const localDoc = getLocalDoc(schema);
  const markdown = [
    '| Property | Type |',
    '| :--- | :--- |',
    properties,
    localDoc ? `[Go To Documentation](${localDoc})` : '',
  ].join('\n');
  return markdown;
}

function getLocalDoc(schema: JSONSchema): string {
  const language = osLocale.sync();
  if (schema.document) {
    return (language && schema.document[language]) || schema.document['default'];
  }
  return ''
}

function getCronReadableDesription(cronStr: string): string[] | undefined {
  recordPageView('/getCronReadableDesription');
  let cron: any | undefined;
  try {
    cron = cronParser.parseExpression(cronStr, { utc: true });
  } catch (ex) {  // 此处是故意 ignore。只有当用户表达式书写有问题时会 throw error
    return;
  }
  let readableDescription: string | undefined;
  let sysLocale = osLocale.sync() || 'en';
  const timeZone = jstz.determine().name() || 'Asia/Shanghai';
  readableDescription = cronstrue.toString(cronStr, { locale: sysLocale.replace('-', '_') });
  const prevTime = new Date(cron.prev().toISOString());
  cron.reset();
  const nextTime = new Date(cron.next().toISOString());
  const result = [
    '__CronExpression Description(UTC)__\n',
    `\t${readableDescription}\n`,
    '__Last execution time__\n',
    `\tUTC: ${prevTime.toLocaleString(sysLocale, { timeZone: 'UTC' })}\n`,
    `\t${timeZone}: ${prevTime.toLocaleString(sysLocale, { timeZone: timeZone })}\n`,
    '__Next execution time__\n',
    `\tUTC: ${nextTime.toLocaleString(sysLocale, { timeZone: 'UTC' })}\n`,
    `\t${timeZone}: ${nextTime.toLocaleString(sysLocale, { timeZone: timeZone })}`
  ];
  return result;
}
