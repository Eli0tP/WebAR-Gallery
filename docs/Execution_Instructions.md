# Execution Instructions
**IAPT Project: Interactive Augmented Reality Gallery**

To properly evaluate and run this Augmented Reality application, please follow these exact steps:

### 1. Prerequisites
- A computer to host the local server.
- A mobile device (smartphone or tablet) equipped with a camera.
- **CRITICAL:** Both the computer and the mobile device MUST be connected to the exact same Wi-Fi network.
- Python 3 installed on the computer.

### 2. Launching the Local Server
Since modern web browsers enforce strict security policies and prohibit camera access on non-secure (`http://`) origins, this project includes a custom Python server that automatically generates a self-signed SSL certificate to host the application securely on a local network.

1. Open your Terminal or Command Prompt.
2. Navigate to the project folder (`Code/Murals`):
   ```
   cd path/to/Code/Murals
   ```
3. Run the secure server script:
   ```
   python start_https_server.py
   ```
   *(Note: On macOS/Linux, you may need to use `python3 start_https_server.py`)*

The terminal will display your Local Network IP address and the connection links. A web browser on your computer will also automatically open the Connection Portal.

### 3. Connecting the Mobile Device
1. Look at the Connection Portal that just opened on your computer screen.
2. Open the native Camera app on your mobile device.
3. **Scan the QR code** displayed on your computer screen.
4. Tap the link to open the AR experience in your mobile web browser.

### 4. Bypassing the Security Warning
Because the local server generates a self-signed SSL certificate, your mobile browser will correctly flag it as an unknown certificate. **You must bypass this warning to grant camera permissions.**

- **On iOS (Safari):** Tap "Show Details" at the bottom, then tap "visit this website".
- **On Android (Chrome):** Tap "Advanced", then tap "Proceed to [IP Address] (unsafe)".

### 5. Running the AR Experience
1. On your mobile device, click the **"Initialize Camera"** button on the web page.
2. When prompted, tap **Allow** to grant the browser access to your camera.
3. Wait a moment for the AI tracking data to load.
4. Point your phone's camera at any of the 9 physical mural artworks.
5. The system will detect the artwork and overlay the corresponding animation. Tap the screen to unmute the audio!

---
*Note: To stop the server when you are finished, press `Ctrl+C` in your terminal.*
