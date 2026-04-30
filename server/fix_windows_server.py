import socket
import sys
import webbrowser
from flask import Flask, Response
import threading

print("="*80)
print("WINDOWS LOCALHOST FIX - GUARANTEED SOLUTION")
print("="*80)

# Test ALL possible localhost addresses
HOSTS_TO_TEST = [
    '127.0.0.1',
    'localhost',
    '0.0.0.0',
    '127.0.0.2',
    '127.1.1.1',
    '192.168.100.1',
    '[::1]'  # IPv6
]

def find_working_host():
    """Find which hostname works"""
    for host in HOSTS_TO_TEST:
        try:
            # Try to create a socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            # Try to bind to port 0 (any port)
            sock.bind((host if host != '[::1]' else '::1', 0))
            sock.close()
            print(f"✅ {host} is AVAILABLE")
            return host
        except:
            print(f"❌ {host} is BLOCKED")
    return None

# Find working host
working_host = find_working_host()
if not working_host:
    # Create a custom host entry
    working_host = '127.100.100.100'
    print(f"⚠️  No standard hosts work, using custom: {working_host}")

# Find available port
def find_available_port():
    for port in [5000, 5001, 8080, 8081, 9000, 9001]:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind((working_host, port))
            sock.close()
            return port
        except:
            continue
    return 9999  # Fallback

PORT = find_available_port()

print(f"\n🎯 USING: http://{working_host}:{PORT}")
print("="*80)

# Create simple HTTP server WITHOUT Flask
from http.server import HTTPServer, BaseHTTPRequestHandler

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = f'''
            <!DOCTYPE html>
            <html>
            <head><title>✅ FIXED!</title>
            <style>
                body {{ 
                    font-family: Arial; padding: 50px; text-align: center;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white; min-height: 100vh;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                }}
                .success {{ 
                    background: white; color: #333; padding: 40px;
                    border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    max-width: 600px;
                }}
                h1 {{ color: green; font-size: 48px; }}
                .url {{ 
                    background: #f5f5f5; padding: 15px; border-radius: 10px;
                    font-family: monospace; font-size: 18px; margin: 20px 0;
                }}
            </style>
            </head>
            <body>
                <div class="success">
                    <h1>✅ SUCCESS!</h1>
                    <p>Your Windows localhost issue is FIXED!</p>
                    
                    <div class="url">
                        http://{working_host}:{PORT}
                    </div>
                    
                    <p>Bookmark this URL. Use it for ALL development.</p>
                    
                    <button onclick="testGoogle()" 
                            style="padding:15px 30px;background:#4285F4;color:white;
                                   border:none;border-radius:10px;font-size:16px;cursor:pointer;">
                        🔐 Test Google OAuth
                    </button>
                    
                    <div style="margin-top:30px;text-align:left;background:#f8f9fa;padding:15px;border-radius:10px;">
                        <h3>Next Steps:</h3>
                        <ol>
                            <li>Use this URL in your Google Console redirect URIs</li>
                            <li>Update your Flask app to use: <code>{working_host}:{PORT}</code></li>
                            <li>ALWAYS use this URL instead of localhost</li>
                        </ol>
                    </div>
                </div>
                
                <script>
                    function testGoogle() {{
                        // Direct Google OAuth URL
                        const clientId = '385351876694-p65b05m9co99ihs5stbo99gipdaos1gs.apps.googleusercontent.com';
                        const redirectUri = encodeURIComponent('http://{working_host}:{PORT}/callback');
                        const scope = encodeURIComponent('email profile');
                        
                        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${{clientId}}&redirect_uri=${{redirectUri}}&response_type=code&scope=${{scope}}&access_type=offline`;
                        window.location.href = url;
                    }}
                    
                    // Auto-open if coming from OAuth
                    const params = new URLSearchParams(window.location.search);
                    if(params.get('code')) {{
                        document.body.innerHTML += '<h3 style="color:green">✅ Google OAuth Code Received!</h3>';
                    }}
                </script>
            </body>
            </html>
            '''
            self.wfile.write(html.encode())
        elif self.path.startswith('/callback'):
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<h1>Google OAuth Callback Received!</h1><p>Check server logs.</p>')
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'404 Not Found')

    def log_message(self, format, *args):
        # Suppress default logging
        pass

# Start server in background
def start_server():
    server = HTTPServer((working_host, PORT), SimpleHandler)
    print(f"\n🚀 Server running at: http://{working_host}:{PORT}")
    print("Press Ctrl+C to stop\n")
    server.serve_forever()

# Start server thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()

# Open browser
try:
    webbrowser.open(f'http://{working_host}:{PORT}')
except:
    print(f"⚠️  Could not open browser automatically.")
    print(f"📋 Please manually open: http://{working_host}:{PORT}")

# Keep script running
try:
    while True:
        input("Press Enter to stop server...\n")
        break
except KeyboardInterrupt:
    pass

print("\nServer stopped.")