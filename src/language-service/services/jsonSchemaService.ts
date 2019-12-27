import * as path from 'path';
import * as fs from 'fs';
import { ext } from '../../extensionVariables';
import { JSONSchema } from '../jsonSchema';
import { rosSchema } from '../schema/rosSchema';

export class UnresolvedSchema {
  schema: JSONSchema;
  errors: string[];

  constructor(schema: JSONSchema, errors: string[] = []) {
    this.schema = schema;
    this.errors = errors;
  }
}

export class ResolvedSchema {
  schema: JSONSchema;
  errors: string[];

  constructor(schema: JSONSchema, errors: string[] = []) {
    this.schema = schema;
    this.errors = errors;
  }
}

export class JSONSchemaService {
  public static jsonSchemaService = new JSONSchemaService();
  public rosResolvedSchema: ResolvedSchema | undefined;
  private constructor() {

  }
  public static getJSONSchemaService(): JSONSchemaService {
    return JSONSchemaService.jsonSchemaService;
  }
  async resolveSchemaContent(schemaToResolve: UnresolvedSchema): Promise<ResolvedSchema> {
    const resolveErrors: string[] = schemaToResolve.errors.slice(0);
    const schema = schemaToResolve.schema;

    const findSection = (
      schema: JSONSchema,
      path: string,
    ): any => {
      if (!path) {
        return schema;
      }
      let current: any = schema;
      if (path[0] === '/') {
        path = path.substring(1);
      }
      path.split('/').some((part) => {
        current = current[part];
        return !current;
      });
      return current;
    }

    const resolveLink = (
      node: any,
      linkedSchema: JSONSchema,
      linkPath: string,
    ): void => {
      const section = findSection(linkedSchema, linkPath);
      if (section) {
        for (const key in section) {
          if (section.hasOwnProperty(key) && !node.hasOwnProperty(key)) {
            node[key] = section[key];
          }
        }
      } else {
        resolveErrors.push(
          'json.schema.invalidref' +
          `$ref '${linkPath}' in ${linkedSchema.id} can not be resolved.`
        );
      }
      delete node.$ref;
    }

    const resolveRefs = (
      node: JSONSchema,
      parentSchema: JSONSchema,
    ): Promise<any> => {
      if (!node) {
        return Promise.resolve(null);
      }

      const toWalk: JSONSchema[] = [node];
      const seen: JSONSchema[] = [];

      const openPromises: Promise<any>[] = [];

      const collectEntries = (...entries: JSONSchema[]) => {
        for (const entry of entries) {
          if (typeof entry === 'object') {
            toWalk.push(entry);
          }
        }
      }

      const collectMapEntries = (...maps: JSONSchema[]) => {
        for (const map of maps) {
          if (typeof map === 'object') {
            for (const key in map) {
              const entry = (map as any)[key];
              toWalk.push(entry);
            }
          }
        }
      }

      const collectArrayEntries = (...arrays: JSONSchema[][]) => {
        for (const array of arrays) {
          if (Array.isArray(array)) {
            toWalk.push.apply(toWalk, array);
          }
        }
      }

      while(toWalk.length) {
        const next = toWalk.pop();
        if (!next) {
          break;
        }
        if (seen.indexOf(next) >= 0) {
          continue;
        }
        seen.push(next);
        if (next.$ref) {
          const segments = next.$ref.split('#', 2);
          resolveLink(next, parentSchema, segments[1]);
        }
        collectEntries(next.items, next.additionalProperties, next.not as any);
        collectMapEntries(
          next.definitions as JSONSchema,
          next.properties as JSONSchema,
          next.patternProperties as JSONSchema,
          next.dependencies as JSONSchema,
        );
        collectArrayEntries(
          next.anyOf as JSONSchema[],
          next.allOf as JSONSchema[],
          next.oneOf as JSONSchema[],
          next.items as JSONSchema[],
        );
      }
      return Promise.all(openPromises);
    }
    await resolveRefs(schema, schema);
    return new ResolvedSchema(schema, resolveErrors);
  }

  async getSchemaForResource(): Promise<ResolvedSchema | void> {
    if (this.rosResolvedSchema) {
      return this.rosResolvedSchema;
    }
    const schemaBasePath = path.resolve(
      ext.context.extensionPath,
      'src',
      'language-service',
      'schema',
    );
    const rosSchemaFileNames = fs.readdirSync(path.resolve(schemaBasePath, 'ros'));
    const baseSchema: any = rosSchema;
    for (const fileName of rosSchemaFileNames) {
      const resourceSchema = require(path.resolve(schemaBasePath, 'ros', fileName));
      if (resourceSchema.$id) {
        baseSchema.definitions[resourceSchema.$id] = resourceSchema;
        baseSchema.properties.Resources.patternProperties['^[a-zA-Z_][a-zA-Z.0-9_-]{0,127}$'].anyOf.push({
          $ref: `#/definitions/${resourceSchema.$id}`,
        })
      }
    }
    this.rosResolvedSchema = await this.resolveSchemaContent(
      new UnresolvedSchema(
        baseSchema,
        []
      ),
    );
    return this.rosResolvedSchema;
  }

  async getSchemaForFlow(): Promise<ResolvedSchema | void> {
    return this.resolveSchemaContent(
      new UnresolvedSchema(
        require(
          path.resolve(
            ext.context.extensionPath,
            'src',
            'language-service',
            'schema',
            'flowSchema.json',
          ),
        ),
      ),
    );
  }
}
