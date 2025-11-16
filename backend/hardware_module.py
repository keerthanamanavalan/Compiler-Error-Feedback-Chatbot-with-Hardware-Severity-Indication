import serial
import time

# Adjust your COM port (check Arduino IDE -> Tools -> Port)
ARDUINO_PORT = "COM3"   # Change this to your actual port (e.g., COM3, COM5)
BAUD_RATE = 9600

arduino = None

def init_arduino():
    global arduino
    try:
        arduino = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=2)
        time.sleep(2)  # Wait for Arduino to initialize
        print(f"✅ Connected to Arduino on {ARDUINO_PORT}")
    except Exception as e:
        print(f"⚠️ Could not connect to Arduino: {e}")
        arduino = None


def send_to_arduino(severity_percent):
    """Send severity value (0–100) to Arduino."""
    global arduino
    if arduino is None:
        print("⚠️ Arduino not connected. Trying to reconnect...")
        init_arduino()

    if arduino:
        try:
            arduino.write(f"{severity_percent}\n".encode())
            print(f"📤 Sent severity {severity_percent}% to Arduino")
        except Exception as e:
            print(f"❌ Error sending to Arduino: {e}")


def update_hardware_from_classification(classification):
    """Extract severity and send it."""
    severity = classification.get("severity_percent", 0)
    send_to_arduino(severity)
    return severity


def get_hardware_status():
    """Return hardware connection status."""
    return {"connected": arduino is not None, "port": ARDUINO_PORT}
