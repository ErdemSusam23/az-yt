document.addEventListener('DOMContentLoaded', function() {
    const videoUrlInput = document.getElementById('videoUrl');
    const getInfoBtn = document.getElementById('getInfoBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loading = document.getElementById('loading');
    const downloadProgress = document.getElementById('downloadProgress');
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    const videoInfo = document.getElementById('videoInfo');

    // Video bilgilerini getir
    getInfoBtn.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();
        
        if (!url) {
            showError('Lütfen bir YouTube URL\'si girin.');
            return;
        }

        if (!isValidYouTubeUrl(url)) {
            showError('Geçerli bir YouTube URL\'si girin.');
            return;
        }

        hideError();
        hideVideoInfo();
        showLoading();

        try {
            const response = await fetch('/get_video_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (response.ok) {
                displayVideoInfo(data);
                showVideoInfo();
            } else {
                showError(data.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            showError('Bağlantı hatası: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    // Video indir
    downloadBtn.addEventListener('click', async function() {
        const url = videoUrlInput.value.trim();
        const quality = document.querySelector('input[name="quality"]:checked').value;

        hideError();
        showDownloadProgress();
        downloadBtn.disabled = true;

        try {
            const response = await fetch('/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url: url,
                    quality: quality 
                })
            });

            if (response.ok) {
                // Dosyayı indir
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                
                // Dosya adını response header'ından al
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'video.mp4';
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch) {
                        filename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }
                
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
                document.body.removeChild(a);
                
                showSuccess('Video başarıyla indirildi!');
            } else {
                const errorData = await response.json();
                showError(errorData.error || 'İndirme sırasında bir hata oluştu.');
            }
        } catch (error) {
            showError('İndirme hatası: ' + error.message);
        } finally {
            hideDownloadProgress();
            downloadBtn.disabled = false;
        }
    });

    // Enter tuşu ile bilgi getir
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getInfoBtn.click();
        }
    });

    // Yardımcı fonksiyonlar
    function isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(watch\?v=|embed\/|v\/|.+\?v=)?([^&=%\?]{11})/;
        return youtubeRegex.test(url);
    }

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
        // 5 saniye sonra hatayı gizle
        setTimeout(hideError, 5000);
    }

    function hideError() {
        errorAlert.classList.add('d-none');
    }

    function showSuccess(message) {
        // Başarı mesajı için geçici alert oluştur
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success';
        successAlert.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
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