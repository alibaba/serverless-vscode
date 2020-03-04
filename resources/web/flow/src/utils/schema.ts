import * as YAML from 'js-yaml';
import * as _ from 'lodash';

const functionNames = [
  'Ref',
  'GetAtt',
];

const yamlType = (name: string, kind: 'sequence' | 'scalar' | 'mapping') => {
  return new YAML.Type(`!${name}`, {
    kind,
    construct: data => {
      return data.toString();
    }
  });
}

const createSchema = () => {
  const types = _.flatten(
    _.map(functionNames, functionName =>
      _.map(['mapping', 'scalar', 'sequence'], kind => yamlType(functionName, kind as any))
    )
  );
  return YAML.Schema.create(types);
};

export const schema = createSchema();
