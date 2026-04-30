import socket
from flask import Flask, redirect, jsonify
import webbrowser

# Force use 127.0.0.1
HOST = '127.0.0.1'
PORT = 5999  # Unlikely to be blocked

app = Flask(__name__)

@app.route('/')
def index():
    return '''
    <html>
    <body style="padding:50px;text-align:center;background:#667eea;color:white;">
        <h1>✅ SUCCESS!</h1>
        <p>Your server is running at:</p>
        <h2>http://''' + HOST + ''':''' + str(PORT) + '''</h2>
        <p>Bookmark this URL!</p>
        <button onclick="location.href='/auth/google'" 
                style="padding:15px 30px;background:white;color:#667eea;border:none;border-radius:5px;cursor:pointer;">
            Test Google Sign In
        </button>
    </body>
    </html>
    '''

@app.route('/auth/google')
def google_auth():
    # Simple redirect to Google
    client_id = '385351876694-p65b05m9co99ihs5stbo99gipdaos1gs.apps.googleusercontent.com'
    redirect_uri = f'http://{HOST}:{PORT}/callback'
    
    from urllib.parse import urlencode
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'email profile'
    }
    
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return redirect(url)

@app.route('/callback')
def callback():
    return redirect('/?success=true')

if __name__ == '__main__':
    print(f"\n🚀 Opening: http://{HOST}:{PORT}")
    webbrowser.open(f'http://{HOST}:{PORT}')
    app.run(host=HOST, port=PORT, debug=False)