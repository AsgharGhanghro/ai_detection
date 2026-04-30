import socket
import requests
import webbrowser
import subprocess
import sys

def check_localhost():
    print("🔍 Diagnosing localhost issue...")
    print("="*50)
    
    # Test 1: Ping localhost
    print("\n1. Testing localhost ping...")
    try:
        subprocess.run(["ping", "-n", "2", "localhost"], check=True)
        print("✅ localhost ping successful")
    except:
        print("❌ localhost ping failed")
    
    # Test 2: Ping 127.0.0.1
    print("\n2. Testing 127.0.0.1 ping...")
    try:
        subprocess.run(["ping", "-n", "2", "127.0.0.1"], check=True)
        print("✅ 127.0.0.1 ping successful")
    except:
        print("❌ 127.0.0.1 ping failed")
    
    # Test 3: Check hosts file
    print("\n3. Checking hosts file...")
    try:
        with open(r"C:\Windows\System32\drivers\etc\hosts", "r") as f:
            content = f.read()
            if "127.0.0.1" in content and "localhost" in content:
                print("✅ Hosts file configured correctly")
            else:
                print("❌ Hosts file missing localhost entry")
                print("   Add: 127.0.0.1    localhost")
    except Exception as e:
        print(f"❌ Cannot read hosts file: {e}")
    
    # Test 4: Check if ports are blocked
    print("\n4. Checking common ports...")
    ports = [80, 3000, 5000, 8080]
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        if result == 0:
            print(f"   Port {port}: ❌ IN USE (might conflict)")
        else:
            print(f"   Port {port}: ✅ AVAILABLE")
    
    # Test 5: Try to create a simple server
    print("\n5. Starting test server...")
    try:
        import http.server
        import socketserver
        import threading
        
        def run_test_server():
            with socketserver.TCPServer(("127.0.0.1", 9999), http.server.SimpleHTTPRequestHandler) as httpd:
                httpd.serve_forever()
        
        thread = threading.Thread(target=run_test_server, daemon=True)
        thread.start()
        
        # Try to connect
        try:
            response = requests.get("http://127.0.0.1:9999", timeout=2)
            print("✅ Test server working on 127.0.0.1:9999")
            webbrowser.open("http://127.0.0.1:9999")
        except:
            print("❌ Cannot connect to test server")
            
    except Exception as e:
        print(f"❌ Test server failed: {e}")
    
    print("\n" + "="*50)
    print("RECOMMENDED SOLUTION:")
    print("1. ALWAYS use 127.0.0.1 instead of localhost")
    print("2. Run this command in CMD as Administrator:")
    print("   netsh int ip reset")
    print("3. Restart your computer")
    print("4. Use the working_server.py script above")
    print("="*50)
    
    # Open working URL
    webbrowser.open("http://127.0.0.1:5000")

if __name__ == "__main__":
    check_localhost()