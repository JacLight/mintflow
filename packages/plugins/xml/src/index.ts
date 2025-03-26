import { convertXmlToJson } from './actions/convert-xml-to-json.js';
import { convertJsonToXml } from './actions/convert-json-to-xml.js';
import { validateXml } from './actions/validate-xml.js';
import { queryXml } from './actions/query-xml.js';

const xmlPlugin = {
    name: 'xml',
    icon: '📝',
    description: 'XML processing utilities for parsing, generating, validating, and querying XML data',
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
    id: 'xml',
    runner: 'node',
    documentation: 'https://mintflow.com/docs/plugins/xml',
    actions: [
        convertXmlToJson,
        convertJsonToXml,
        validateXml,
        queryXml
    ]
};

export default xmlPlugin;
