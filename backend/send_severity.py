import serial
import time

# Change the COM port to match your Arduino (check in Arduino IDE → Tools → Port)
arduino = serial.Serial(port='COM3', baudrate=9600, timeout=1)
time.sleep(2)  # Wait for Arduino to initialize

def send_severity(value):
    if 0 <= value <= 100:
        arduino.write(f"{value}\n".encode())  # Send value as string with newline
        print(f"Sent severity: {value}%")
    else:
        print("Invalid value (must be 0–100)")

# Example usage
severity_percent = 85  # <-- You can replace this with your backend-calculated value
send_severity(severity_percent)
