import { convertTextToJson } from './actions/convert-text-to-json.js';
import { convertJsonToText } from './actions/convert-json-to-text.js';

const jsonPlugin = {
    name: 'json',
    icon: '📄',
    description: 'Convert between JSON and text formats',
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
    id: 'json',
    runner: 'node',
    documentation: 'https://mintflow.com/docs/plugins/json',
    actions: [
        convertTextToJson,
        convertJsonToText
    ]
};

export default jsonPlugin;
