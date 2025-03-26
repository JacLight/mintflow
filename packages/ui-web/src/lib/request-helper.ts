import axios from 'axios';


export const callServer = async (url: string, method: string, data: any, headers: any) => {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers,
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return error.response.data;
        } else {
            return { error: 'Network error' };
        }
    }

}