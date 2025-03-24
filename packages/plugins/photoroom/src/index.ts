import { removeBackground } from './actions/index.js';

const photoroomPlugin = {
    name: "PhotoRoom",
    icon: "TbPhotoEdit",
    description: "Background removal and image editing",
    id: "photoroom",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            api_key: {
                type: "string",
                description: "Your PhotoRoom API key",
                required: true,
            }
        }
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        api_key: "YOUR_API_KEY",
    },
    exampleOutput: {
        fileName: "output.png",
        url: "data:image/png;base64,...",
        base64: "base64_encoded_image_data"
    },
    documentation: "https://www.photoroom.com/api",
    method: "exec",
    actions: [
        removeBackground
    ]
};

export default photoroomPlugin;
