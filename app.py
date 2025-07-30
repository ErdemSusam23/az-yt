import os
import certifi
os.environ['SSL_CERT_FILE'] = certifi.where()
from flask import Flask, render_template, request, jsonify, send_file
from pytubefix import YouTube
from pytubefix.cli import on_progress
import re
import tempfile

app = Flask(__name__)

# Ana sayfa
@app.route('/')
def index():
    return render_template('index.html')

# Video bilgilerini getir
@app.route('/get_video_info', methods=['POST'])
def get_video_info():
    try:
        url = request.json['url']
        
        # URL doğrulama
        if not is_valid_youtube_url(url):
            return jsonify({'error': 'Geçerli bir YouTube URL\'si girin'}), 400
        
        yt = YouTube(url, on_progress_callback = on_progress)
        
        video_info = {
            'title': yt.title,
            'thumbnail': yt.thumbnail_url,
            'length': f"{yt.length // 60}:{yt.length % 60:02d}",
            'views': f"{yt.views:,}",
            'author': yt.author
        }
        
        return jsonify(video_info)
    
    except Exception as e:
        return jsonify({'error': f'Video bilgileri alınamadı: {str(e)}'}), 500

# Video indirme
@app.route('/download', methods=['POST'])
def download_video():
    try:
        url = request.json['url']
        quality = request.json.get('quality', 'highest')
        
        yt = YouTube(url)
        
        # Video kalitesine göre stream seç
        if quality == 'highest':
            stream = yt.streams.get_highest_resolution()
        else:
            stream = yt.streams.get_lowest_resolution()
        
        # Geçici dosya oluştur
        temp_dir = tempfile.mkdtemp()
        filename = re.sub(r'[^\w\s-]', '', yt.title)[:50] + '.mp4'
        filepath = os.path.join(temp_dir, filename)
        
        # Videoyu indir
        stream.download(output_path=temp_dir, filename=filename)
        
        return send_file(filepath, as_attachment=True, download_name=filename)
    
    except Exception as e:
        return jsonify({'error': f'Video indirilemedi: {str(e)}'}), 500

def is_valid_youtube_url(url):
    youtube_regex = re.compile(
        r'(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/'
        r'(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
    )
    return youtube_regex.match(url) is not None

if __name__ == '__main__':
    app.run(debug=True)