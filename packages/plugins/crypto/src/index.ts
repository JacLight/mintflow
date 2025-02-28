import { hashText } from './actions/hash-text.js';
import { hmacSignature } from './actions/hmac-signature.js';
import { generatePassword } from './actions/generate-password.js';

const cryptoPlugin = {
    name: 'crypto',
    icon: '🔐',
    description: 'Cryptographic utilities for hashing, signing, and generating passwords',
    id: 'crypto',
    runner: 'node',
    documentation: 'https://mintflow.com/docs/plugins/crypto',
    actions: [
        hashText,
        hmacSignature,
        generatePassword
    ]
};

export default cryptoPlugin;
