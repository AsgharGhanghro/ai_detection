"""
Startup script for AI Detection Server
Handles environment setup and server initialization
"""
import os
import sys
import subprocess

def setup_environment():
    """Setup the Python environment for the server"""
    # Add the server directory to Python path
    server_dir = os.path.dirname(os.path.abspath(__file__))
    if server_dir not in sys.path:
        sys.path.insert(0, server_dir)
    
    # Create artifacts directory if it doesn't exist
    artifacts_dir = os.path.join(server_dir, 'artifacts')
    os.makedirs(artifacts_dir, exist_ok=True)
    
    print(f"Server directory: {server_dir}")
    print(f"Python path: {sys.path[:3]}...")  # Show first 3 entries
    return server_dir

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'flask',
        'flask_cors',
        'flask_limiter',
        'numpy'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing packages: {missing_packages}")
        print("Installing missing packages...")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', *missing_packages
            ])
            print("Packages installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install packages: {e}")
            return False
    
    return True

def main():
    """Main startup function"""
    print("=" * 50)
    print("AI Detection Server Startup")
    print("=" * 50)
    
    # Setup environment
    server_dir = setup_environment()
    
    # Check dependencies
    if not check_dependencies():
        print("Failed to setup dependencies. Exiting.")
        return 1
    
    try:
        # Import and run the app
        from app import app
        
        print("\nStarting Flask development server...")
        print("Server will be available at:")
        print("  - http://localhost:5000")
        print("  - http://127.0.0.1:5000")
        print("\nAPI Endpoints:")
        print("  - GET  /api/health")
        print("  - POST /api/analyze")
        print("  - GET  /api/models")
        print("  - GET  /api/stats")
        print("  - POST /api/export")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 50)
        
        # Run the app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
        
    except Exception as e:
        print(f"\nError starting server: {e}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Server directory: {server_dir}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main())