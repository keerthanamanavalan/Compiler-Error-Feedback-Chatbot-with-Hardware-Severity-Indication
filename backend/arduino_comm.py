# arduino_comm.py
import time
import serial
import serial.tools.list_ports

def auto_detect_port():
    """Auto-detect the Arduino port."""
    ports = serial.tools.list_ports.comports()
    for p in ports:
        if "Arduino" in p.description or "ttyACM" in p.device or "usbmodem" in p.device:
            return p.device
    return None

def send_to_arduino(severity_value, port=None):
    """Send the severity percentage (0–100) to the Arduino."""
    if not (0 <= severity_value <= 100):
        print(f"⚠️ Invalid value: {severity_value}")
        return False

    port = port or auto_detect_port()
    if not port:
        print("❌ Arduino not detected. Plug it in and retry.")
        return False

    try:
        ser = serial.Serial(port, 9600, timeout=1)
        time.sleep(2)  # Give Arduino time to reset
        ser.write(f"{severity_value}\n".encode())
        print(f"✅ Sent severity {severity_value}% → Arduino on {port}")
        ser.close()
        return True
    except Exception as e:
        print("⚠️ Serial error:", e)
        return False
