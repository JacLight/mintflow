import axios from 'axios';

const getResourcePath = (resourceName: string) => {
    return ``;
}

export async function uploadWithProgress(location: string, file, onProgress) {
    // notificationStore.showSiteBusy(true);

    console.debug('request -> updateData', file);

    const formData = new FormData();
    formData.append('location', location);
    formData.append('file', file);

    const config = {
        headers: {
            // Authorization: activeSession.getToken(),
            // orgid: appConfig.siteId,
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) {
                onProgress(percentCompleted);
            }
        }
    };

    try {
        let rt = await axios.post(location, formData, config);
        console.debug('upload -> success', location);
        return rt.data;
    } catch (error) {
        console.error('upload - error', location);
        console.error(error);
        // notificationStore.addNotification({ message: 'File Upload failed: ' + error.message, type: SiteNotificationType.Error, });
    } finally {
        // notificationStore.showSiteBusy(false);
    }
}


export async function deleteFile(location: string) {
    return ''
}