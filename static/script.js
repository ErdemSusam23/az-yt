document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const videoUrlInput = document.getElementById('videoUrl');
    const getInfoBtn = document.getElementById('getInfoBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const downloadProgress = document.getElementById('downloadProgress');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const videoInfo = document.getElementById('videoInfo');

    // Mock data for demonstration (replace with actual API calls)
    const mockVideoData = {
        title: "NieR: Automata - YoRHa Unit Data Analysis",
        author: "YoRHa Command Center",
        length: "03:42",
        views: "2,847,596",
        thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23d1cdb7'/%3E%3Crect x='10' y='10' width='180' height='130' fill='none' stroke='%232c2c2c' stroke-width='2'/%3E%3Ctext x='100' y='80' text-anchor='middle' font-family='monospace' font-size='12' fill='%232c2c2c'%3EVIDEO THUMBNAIL%3C/text%3E%3C/svg%3E"
    };

    // Event Listeners
    getInfoBtn.addEventListener('click', handleGetVideoInfo);
    downloadBtn.addEventListener('click', handleDownloadVideo);
    videoUrlInput.addEventListener('keypress', handleEnterKey);

    // Get video information
    async function handleGetVideoInfo() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showError('ERROR: URL gerekli parametresi eksik.');
            return;
        }

        if (!isValidYouTubeUrl(url)) {
            showError('ERROR: Geçersiz YouTube URL formatı.');
            return;
        }

        hideError();
        hideVideoInfo();
        showLoading();

        try {
            // Replace this with actual API call to your Flask backend
            // const response = await fetch('/get_video_info', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ url: url })
            // });
            
            // const data = await response.json();
            
            // For demo purposes, using mock data with timeout
            await simulateApiCall(2000);
            
            displayVideoInfo(mockVideoData);
            showVideoInfo();
            showSuccess('BAŞARILI: Video verileri alındı.');
            
        } catch (error) {
            showError('ERROR: Bağlantı hatası - ' + error.message);
        } finally {
            hideLoading();
        }
    }

    // Download video
    async function handleDownloadVideo() {
        const url = videoUrlInput.value.trim();
        const quality = document.querySelector('input[name="quality"]:checked').value;

        hideError();
        showDownloadProgress();
        downloadBtn.disabled = true;

        try {
            // Replace this with actual API call to your Flask backend
            // const response = await fetch('/download', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ 
            //         url: url,
            //         quality: quality 
            //     })
            // });

            // if (response.ok) {
            //     const blob = await response.blob();
            //     const downloadUrl = window.URL.createObjectURL(blob);
            //     const a = document.createElement('a');
            //     a.href = downloadUrl;
            //     
            //     const contentDisposition = response.headers.get('Content-Disposition');
            //     let filename = 'video.mp4';
            //     if (contentDisposition) {
            //         const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            //         if (filenameMatch) {
            //             filename = filenameMatch[1].replace(/['"]/g, '');
            //         }
            //     }
            //     
            //     a.download = filename;
            //     document.body.appendChild(a);
            //     a.click();
            //     window.URL.revokeObjectURL(downloadUrl);
            //     document.body.removeChild(a);
            //     
            //     showSuccess('BAŞARILI: Video indirme işlemi tamamlandı.');
            // } else {
            //     const errorData = await response.json();
            //     showError('ERROR: ' + (errorData.error || 'İndirme sırasında hata oluştu'));
            // }

            // For demo purposes, simulate download
            await simulateApiCall(3000);
            showSuccess('BAŞARILI: Video indirme işlemi tamamlandı.');

        } catch (error) {
            showError('ERROR: İndirme hatası - ' + error.message);
        } finally {
            hideDownloadProgress();
            downloadBtn.disabled = false;
        }
    }

    // Handle Enter key press
    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            getInfoBtn.click();
        }
    }

    // Utility Functions
    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=%\?]{11})/;
        return youtubeRegex.test(url);
    }

    function simulateApiCall(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // UI State Management Functions
    function showLoading() {
        loading.classList.remove('d-none');
    }

    function hideLoading() {
        loading.classList.add('d-none');
    }

    function showDownloadProgress() {
        downloadProgress.classList.remove('d-none');
    }

    function hideDownloadProgress() {
        downloadProgress.classList.add('d-none');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.classList.remove('d-none');
        setTimeout(hideError, 5000);
    }

    function hideError() {
        errorAlert.classList.add('d-none');
    }

    function showSuccess(message) {
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success';
        successAlert.textContent = message;
        
        errorAlert.parentNode.insertBefore(successAlert, errorAlert);
        
        setTimeout(() => {
            successAlert.remove();
        }, 3000);
    }

    function displayVideoInfo(data) {
        document.getElementById('videoTitle').textContent = data.title;
        document.getElementById('videoAuthor').textContent = data.author;
        document.getElementById('videoDuration').textContent = data.length;
        document.getElementById('videoViews').textContent = data.views;
        document.getElementById('videoThumbnail').src = data.thumbnail;
    }

    function showVideoInfo() {
        videoInfo.classList.remove('d-none');
    }

    function hideVideoInfo() {
        videoInfo.classList.add('d-none');
    }
});