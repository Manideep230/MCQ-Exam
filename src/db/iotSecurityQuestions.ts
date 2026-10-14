export interface RawQuestion {
  questionText: string;
  options: Record<string, string>;
  correctOption: string;
}

export const IOT_SECURITY_QUESTIONS: RawQuestion[] = [
  {
    "questionText": "What is IoT security?",
    "options": {
      "A": "Protecting connected devices, networks, data, and applications from threats",
      "B": "Increasing the screen resolution of connected devices",
      "C": "Improving the physical size of sensors",
      "D": "Reducing the number of device buttons",
      "E": "Increasing internet subscription speed",
      "F": "Designing device enclosures for appearance only",
      "G": "Converting every sensor reading into an image",
      "H": "Removing all communication from connected systems"
    },
    "correctOption": "A"
  },
  {
    "questionText": "Why is IoT security important?",
    "options": {
      "A": "It guarantees that devices never need maintenance",
      "B": "It prevents every possible hardware failure",
      "C": "It helps prevent unauthorized control, data theft, and service disruption",
      "D": "It makes all IoT devices independent of electricity",
      "E": "It automatically increases sensor accuracy",
      "F": "It eliminates the need for system testing",
      "G": "It guarantees unlimited network bandwidth",
      "H": "It replaces every physical safety mechanism"
    },
    "correctOption": "C"
  },
  {
    "questionText": "How is IoT security different from traditional IT security?",
    "options": {
      "A": "IoT systems never store data",
      "B": "IoT security only concerns website passwords",
      "C": "IoT devices cannot connect to networks",
      "D": "IoT security also considers constrained hardware, physical exposure, and real-world effects",
      "E": "Traditional IT systems never require authentication",
      "F": "IoT systems never use software",
      "G": "IoT security only applies to cloud storage",
      "H": "IoT devices are always physically inaccessible"
    },
    "correctOption": "D"
  },
  {
    "questionText": "Which set contains the six major IoT security areas used in this test?",
    "options": {
      "A": "Keyboard, monitor, printer, mouse, speaker, scanner",
      "B": "Device, communication, gateway, cloud, application, human",
      "C": "Battery, casing, screws, display, fan, stand",
      "D": "Browser, spreadsheet, presentation, email, calendar, editor",
      "E": "CPU, RAM, keyboard, mouse, monitor, printer",
      "F": "Database, keyboard, monitor, printer, camera, speaker",
      "G": "Sensor, battery, screen, charger, cable, enclosure",
      "H": "Website, document, image, video, audio, animation"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What does the CIA triad represent?",
    "options": {
      "A": "Control, Internet, Automation",
      "B": "Connection, Inspection, Access",
      "C": "Computing, Integration, Analytics",
      "D": "Certification, Identification, Authorization",
      "E": "Confidentiality, Integrity, Availability",
      "F": "Cloud, Interface, Application",
      "G": "Configuration, Installation, Assessment",
      "H": "Communication, Inspection, Authentication"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is an attack surface in an IoT system?",
    "options": {
      "A": "The area of a device's outer casing",
      "B": "The total weight of connected sensors",
      "C": "The physical distance between two devices",
      "D": "The number of screens on a dashboard",
      "E": "The total battery capacity of a device",
      "F": "The set of points through which an attacker could access or affect a system",
      "G": "The number of users registered in an application",
      "H": "The surface area used to mount an antenna"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What is defense in depth?",
    "options": {
      "A": "Using multiple layers of security controls",
      "B": "Using only one password for every device",
      "C": "Removing all monitoring tools",
      "D": "Connecting every device to the same unrestricted network",
      "E": "Disabling security updates",
      "F": "Relying entirely on physical locks",
      "G": "Giving every user administrator privileges",
      "H": "Storing every credential in a public file"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is a vulnerability in IoT security?",
    "options": {
      "A": "A confirmed security policy",
      "B": "A successful firmware update",
      "C": "A weakness that an attacker could exploit",
      "D": "A routine sensor measurement",
      "E": "A correctly configured firewall",
      "F": "A verified device identity",
      "G": "A completed backup",
      "H": "A successful authentication event"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is a threat in cybersecurity?",
    "options": {
      "A": "A guarantee that a system is secure",
      "B": "A type of battery used by sensors",
      "C": "A method for calibrating a sensor",
      "D": "A potential cause of harm to a system",
      "E": "A dashboard color scheme",
      "F": "A data storage format",
      "G": "A device mounting bracket",
      "H": "A routine software installation"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is the difference between a vulnerability and a threat?",
    "options": {
      "A": "A threat is always a software update; a vulnerability is always hardware",
      "B": "A vulnerability is a weakness; a threat is a potential source or event of harm",
      "C": "A vulnerability is a security policy; a threat is a backup",
      "D": "A threat is a sensor; a vulnerability is a gateway",
      "E": "Both terms always mean exactly the same thing",
      "F": "A vulnerability is an alert; a threat is a report",
      "G": "A threat is a password; a vulnerability is an encryption key",
      "H": "A vulnerability is a network cable; a threat is a router"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What does risk in IoT security describe?",
    "options": {
      "A": "The number of sensors in a system",
      "B": "The total length of network cables",
      "C": "The physical size of a gateway",
      "D": "The number of application screens",
      "E": "The possibility and impact of harm from a threat exploiting a weakness",
      "F": "The age of the oldest device only",
      "G": "The amount of data stored, regardless of context",
      "H": "The number of buttons on a device"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is the principle of least privilege?",
    "options": {
      "A": "Give all devices full network access",
      "B": "Allow every user to change security settings",
      "C": "Give every account the same permissions",
      "D": "Disable all user accounts",
      "E": "Give devices permanent administrator access",
      "F": "Grant only the permissions needed for the assigned task",
      "G": "Share administrator credentials with all users",
      "H": "Permit access without checking identity"
    },
    "correctOption": "F"
  },
  {
    "questionText": "Why should default passwords be changed on IoT devices?",
    "options": {
      "A": "Default passwords increase sensor accuracy",
      "B": "Default credentials may be publicly known or easy to guess",
      "C": "Changing passwords automatically upgrades hardware",
      "D": "Default passwords prevent firmware updates",
      "E": "Password changes eliminate the need for encryption",
      "F": "Changing passwords increases wireless range",
      "G": "Default passwords prevent all network traffic",
      "H": "Password changes replace device authentication"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is the difference between security and safety in IoT?",
    "options": {
      "A": "Security concerns appearance; safety concerns cost",
      "B": "Security concerns batteries; safety concerns databases",
      "C": "Security protects against unauthorized or malicious actions; safety reduces harm to people and equipment",
      "D": "Security applies only to cloud systems; safety only to websites",
      "E": "Security means faster processing; safety means more storage",
      "F": "Security and safety are identical in every context",
      "G": "Security prevents every accident automatically",
      "H": "Safety is only about preventing password theft"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is a security policy in an IoT system?",
    "options": {
      "A": "A set of documented rules for protecting devices, data, users, and services",
      "B": "A list of sensor prices",
      "C": "A chart showing device temperatures only",
      "D": "A physical cable layout",
      "E": "A collection of unrelated photographs",
      "F": "A list of employee birthdays",
      "G": "A method of increasing processor speed",
      "H": "A design for the device enclosure ## SECTION B — IoT ATTACKS AND THREATS"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is a brute-force attack?",
    "options": {
      "A": "Measuring the voltage of a sensor",
      "B": "Updating device firmware through an approved process",
      "C": "Backing up a database",
      "D": "Repeatedly trying possible passwords or credentials",
      "E": "Checking a device's physical dimensions",
      "F": "Testing a sensor's calibration",
      "G": "Dividing a network into segments",
      "H": "Compressing telemetry data"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is malware in an IoT system?",
    "options": {
      "A": "A legitimate sensor driver",
      "B": "A network performance report",
      "C": "A secure certificate",
      "D": "An approved firmware update",
      "E": "A battery monitoring feature",
      "F": "A malicious software program that compromises or misuses a system",
      "G": "A device installation manual",
      "H": "A routine backup file"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What is a Denial-of-Service (DoS) attack?",
    "options": {
      "A": "An authorized firmware update",
      "B": "An attack that makes a device or service unavailable",
      "C": "A method for increasing data accuracy",
      "D": "A process for registering new devices",
      "E": "A secure method of certificate renewal",
      "F": "A technique for calibrating temperature sensors",
      "G": "A process for reducing battery consumption",
      "H": "A normal data synchronization operation"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is a Man-in-the-Middle (MitM) attack?",
    "options": {
      "A": "A technician physically installs a sensor",
      "B": "A gateway stores data temporarily",
      "C": "A cloud service generates a report",
      "D": "A sensor measures the middle of a room",
      "E": "An attacker intercepts or potentially alters communication between parties",
      "F": "A device sends a valid status update",
      "G": "A firewall blocks unauthorized traffic",
      "H": "A user changes a dashboard setting"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is device spoofing in IoT?",
    "options": {
      "A": "Reducing a sensor's sampling frequency",
      "B": "Replacing a device battery",
      "C": "Pretending to be a legitimate device or impersonating its identity",
      "D": "Compressing device logs",
      "E": "Improving wireless signal strength",
      "F": "Updating a device's display",
      "G": "Creating a network diagram",
      "H": "Installing an authorized application"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is a replay attack?",
    "options": {
      "A": "Capturing valid messages and retransmitting them later",
      "B": "Replacing a faulty temperature sensor",
      "C": "Measuring network latency",
      "D": "Creating a fresh cryptographic key",
      "E": "Rotating a device's antenna",
      "F": "Generating a new dashboard",
      "G": "Testing a battery under load",
      "H": "Updating an access policy"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is an IoT botnet?",
    "options": {
      "A": "A group of authorized devices used only for calibration",
      "B": "A collection of sensor manuals",
      "C": "A set of unrelated cloud dashboards",
      "D": "A group of compromised devices controlled by an attacker",
      "E": "A collection of device certificates awaiting renewal",
      "F": "A group of secure gateways",
      "G": "A list of network addresses approved by an administrator",
      "H": "A database containing maintenance schedules"
    },
    "correctOption": "D"
  },
  {
    "questionText": "How can insecure firmware expose an IoT device to attacks?",
    "options": {
      "A": "It guarantees that all connections are encrypted",
      "B": "It automatically blocks unauthorized commands",
      "C": "It prevents all physical access",
      "D": "It makes the device immune to malware",
      "E": "It guarantees that a sensor is calibrated",
      "F": "It may contain exploitable bugs, weak authentication, or outdated components",
      "G": "It removes every network service",
      "H": "It ensures all certificates remain valid forever"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What is phishing, and how can it affect IoT security?",
    "options": {
      "A": "Measuring a sensor's output voltage",
      "B": "Tricking people into revealing credentials or performing unsafe actions",
      "C": "Encrypting data before transmission",
      "D": "Separating devices into VLANs",
      "E": "Generating a firmware checksum",
      "F": "Updating a certificate authority",
      "G": "Calibrating a motion detector",
      "H": "Testing an actuator's response time"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is a distributed denial-of-service (DDoS) attack?",
    "options": {
      "A": "A local backup performed by one device",
      "B": "An authorized network maintenance procedure",
      "C": "A method for reducing cloud storage",
      "D": "A secure device registration process",
      "E": "A sensor calibration routine",
      "F": "A firmware verification operation",
      "G": "A denial-of-service attack launched from multiple systems",
      "H": "A procedure for renewing certificates"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What is a physical attack on an IoT device?",
    "options": {
      "A": "A normal cloud database query",
      "B": "A scheduled software backup",
      "C": "Physically tampering with a device or attempting to extract information from it",
      "D": "An approved dashboard update",
      "E": "A routine temperature measurement",
      "F": "A valid certificate renewal",
      "G": "A standard telemetry upload",
      "H": "A network segmentation policy ## SECTION C — AUTHENTICATION AND DIGITAL CERTIFICATES"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is authentication?",
    "options": {
      "A": "Determining the physical size of a device",
      "B": "Compressing sensor readings",
      "C": "Allocating storage space",
      "D": "Verifying the identity of a user, device, or service",
      "E": "Measuring network throughput",
      "F": "Creating a data visualization",
      "G": "Updating a device's display",
      "H": "Selecting a sensor sampling rate"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is authorization?",
    "options": {
      "A": "Determining what an authenticated entity is permitted to do",
      "B": "Proving that a sensor is physically present",
      "C": "Generating a new network cable",
      "D": "Measuring the temperature of a device",
      "E": "Encrypting every file automatically",
      "F": "Installing a new battery",
      "G": "Testing an antenna's range",
      "H": "Compressing application logs"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is the difference between authentication and authorization?",
    "options": {
      "A": "Authentication stores data; authorization measures it",
      "B": "Authentication updates firmware; authorization updates hardware",
      "C": "Authentication controls temperature; authorization controls humidity",
      "D": "Authentication and authorization are always interchangeable",
      "E": "Authentication verifies identity; authorization determines permitted access",
      "F": "Authentication creates network cables; authorization creates sensors",
      "G": "Authentication checks battery level; authorization checks voltage",
      "H": "Authentication is for hardware only; authorization is for cloud storage only"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is multi-factor authentication (MFA)?",
    "options": {
      "A": "Using one password on multiple devices",
      "B": "Using two or more distinct categories of verification factors",
      "C": "Using only a device serial number",
      "D": "Disabling account verification",
      "E": "Sharing credentials between administrators",
      "F": "Requiring multiple dashboard screens",
      "G": "Connecting a device to multiple Wi-Fi networks",
      "H": "Storing multiple copies of the same password"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is a digital certificate in IoT?",
    "options": {
      "A": "A file containing only sensor readings",
      "B": "A device's physical warranty card",
      "C": "A document listing network bandwidth",
      "D": "A password stored as plain text",
      "E": "A database backup",
      "F": "A digitally signed document binding an identity to a public key",
      "G": "A device's battery report",
      "H": "A list of application colors"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What is the role of a Certificate Authority (CA)?",
    "options": {
      "A": "Measure sensor accuracy",
      "B": "Allocate IP addresses to every device",
      "C": "Verify identities under its rules and issue digitally signed certificates",
      "D": "Control the physical temperature of devices",
      "E": "Replace all private keys with passwords",
      "F": "Store all telemetry indefinitely",
      "G": "Create every device's firmware",
      "H": "Guarantee that no cyberattack can occur"
    },
    "correctOption": "C"
  },
  {
    "questionText": "Which information is commonly included in a digital certificate?",
    "options": {
      "A": "Subject identity, public key, issuer, validity period, serial number, and signature",
      "B": "Only the device's battery percentage",
      "C": "Only the user's account password",
      "D": "Only a sensor's last measured value",
      "E": "Only the network's monthly cost",
      "F": "Only the device enclosure dimensions",
      "G": "Only the cloud provider's storage quota",
      "H": "Only a list of dashboard colors"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is Public Key Infrastructure (PKI)?",
    "options": {
      "A": "A method for measuring network speed",
      "B": "A type of physical sensor",
      "C": "A database indexing technique",
      "D": "A system for managing public-key identities, certificates, trust, and related processes",
      "E": "A battery charging standard",
      "F": "A dashboard design framework",
      "G": "A protocol used only for temperature measurement",
      "H": "A method for reducing device size"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is the purpose of a private key?",
    "options": {
      "A": "To publish confidential passwords",
      "B": "To make every network address public",
      "C": "To replace all digital certificates",
      "D": "To store sensor readings in plain text",
      "E": "To provide unlimited network access",
      "F": "To measure the physical distance between devices",
      "G": "To perform cryptographic operations such as signing or decryption, depending on the algorithm",
      "H": "To act as a public device serial number"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What is the purpose of a public key?",
    "options": {
      "A": "To serve as the secret password for every device",
      "B": "To support operations such as signature verification or encryption, depending on the algorithm",
      "C": "To replace the device's physical sensor",
      "D": "To guarantee unlimited storage",
      "E": "To disable certificate validation",
      "F": "To store private credentials in a public file",
      "G": "To prevent all hardware failures",
      "H": "To measure network temperature"
    },
    "correctOption": "B"
  },
  {
    "questionText": "How do digital certificates help secure IoT communication?",
    "options": {
      "A": "They automatically increase battery capacity",
      "B": "They eliminate all network delays",
      "C": "They help verify identities and support authenticated secure connections",
      "D": "They replace the need for network protocols",
      "E": "They guarantee that all device software is bug-free",
      "F": "They increase sensor range",
      "G": "They eliminate the need for access control",
      "H": "They automatically repair damaged hardware"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is certificate revocation?",
    "options": {
      "A": "Extending a device's battery life",
      "B": "Changing a sensor's sampling frequency",
      "C": "Compressing certificate files",
      "D": "Converting a certificate into telemetry",
      "E": "Declaring a certificate untrusted before its scheduled expiry",
      "F": "Replacing a network gateway",
      "G": "Increasing the certificate's storage size",
      "H": "Moving a device to another room"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What happens when an IoT device's certificate expires?",
    "options": {
      "A": "The device automatically gains administrator access",
      "B": "All network encryption becomes stronger",
      "C": "The certificate becomes valid indefinitely",
      "D": "The sensor automatically recalibrates",
      "E": "The device's hardware is permanently disabled in every system",
      "F": "Systems enforcing certificate validity should reject it for uses requiring a valid certificate",
      "G": "The certificate automatically renews without any process",
      "H": "The device's private key becomes public by definition"
    },
    "correctOption": "F"
  },
  {
    "questionText": "Why should IoT devices use unique identities and credentials?",
    "options": {
      "A": "To make all devices share the same permissions",
      "B": "To eliminate the need for secure updates",
      "C": "To ensure all devices use identical network addresses",
      "D": "To identify and authenticate devices individually and limit the impact of compromised credentials",
      "E": "To make device monitoring unnecessary",
      "F": "To prevent devices from sending telemetry",
      "G": "To guarantee zero maintenance",
      "H": "To remove the need for access control ## SECTION D — IoT DEVICE AND FIRMWARE SECURITY"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is secure boot?",
    "options": {
      "A": "A method for increasing battery capacity",
      "B": "A process that verifies software authenticity or integrity before allowing it to run",
      "C": "A way to improve wireless range",
      "D": "A method of compressing sensor data",
      "E": "A system for displaying dashboards",
      "F": "A procedure for cleaning device enclosures",
      "G": "A technique for increasing screen brightness",
      "H": "A method for scheduling cloud reports"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is firmware in an IoT device?",
    "options": {
      "A": "A cloud storage subscription",
      "B": "A network security policy document",
      "C": "A dashboard theme",
      "D": "A collection of sensor photographs",
      "E": "A device's external packaging",
      "F": "Low-level software that controls hardware and core device functions",
      "G": "A network cable specification",
      "H": "A user account recovery form"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What is an over-the-air (OTA) update?",
    "options": {
      "A": "Remotely delivering software or firmware updates over a network",
      "B": "Physically replacing every device's circuit board",
      "C": "Measuring a device's antenna length",
      "D": "Changing a sensor's location manually",
      "E": "Printing a device's serial number",
      "F": "Moving a device to a different building",
      "G": "Replacing the cloud provider",
      "H": "Removing all device software"
    },
    "correctOption": "A"
  },
  {
    "questionText": "Why must firmware updates be authenticated?",
    "options": {
      "A": "To make updates larger",
      "B": "To guarantee that updates never require testing",
      "C": "To ensure updates come from a trusted source and have not been substituted by an attacker",
      "D": "To eliminate all hardware limitations",
      "E": "To prevent administrators from installing updates",
      "F": "To increase device weight",
      "G": "To change sensor readings randomly",
      "H": "To remove the need for device identity"
    },
    "correctOption": "C"
  },
  {
    "questionText": "Why is firmware integrity important?",
    "options": {
      "A": "It increases the physical size of the device",
      "B": "It guarantees unlimited memory",
      "C": "It makes all network traffic public",
      "D": "It removes the need for access control",
      "E": "It helps detect unauthorized modification of firmware",
      "F": "It replaces the device's sensor",
      "G": "It ensures every update is unnecessary",
      "H": "It prevents all power failures"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is hardware security in IoT?",
    "options": {
      "A": "Designing dashboard icons",
      "B": "Protecting hardware and security-related functions against physical and logical attacks",
      "C": "Increasing the number of application screens",
      "D": "Improving the color quality of device displays",
      "E": "Storing every credential in a public database",
      "F": "Disabling all device authentication",
      "G": "Replacing all sensors with cloud software",
      "H": "Measuring only the physical dimensions of a device"
    },
    "correctOption": "B"
  },
  {
    "questionText": "Why should debug ports be secured on IoT devices?",
    "options": {
      "A": "They are required to display every dashboard",
      "B": "They automatically control the cloud database",
      "C": "They increase sensor accuracy",
      "D": "Unprotected debug ports may expose memory, firmware, or privileged functions",
      "E": "They guarantee that certificates remain valid",
      "F": "They eliminate the need for software updates",
      "G": "They increase the battery's chemical capacity",
      "H": "They prevent all network communication"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is secure key storage?",
    "options": {
      "A": "Keeping every key in a public document",
      "B": "Sending private keys in unencrypted messages",
      "C": "Using the same private key for all customers without controls",
      "D": "Storing credentials in a publicly accessible log",
      "E": "Disabling all cryptographic functions",
      "F": "Protecting cryptographic keys from unauthorized access or misuse",
      "G": "Printing every private key on the device casing",
      "H": "Uploading private keys to an unrestricted website"
    },
    "correctOption": "F"
  },
  {
    "questionText": "Why is IoT security important throughout a device's lifecycle?",
    "options": {
      "A": "Security risks exist from manufacturing and provisioning through deployment, maintenance, and retirement",
      "B": "Security matters only on the first day of use",
      "C": "Devices never require credential management after installation",
      "D": "Decommissioned devices can always retain all credentials safely",
      "E": "Firmware cannot become outdated",
      "F": "Device ownership never changes",
      "G": "Physical access is impossible after installation",
      "H": "Security updates are unnecessary once a device connects to Wi-Fi ## SECTION E — IoT NETWORK SECURITY"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is a firewall?",
    "options": {
      "A": "A device used only to measure humidity",
      "B": "A physical wall around a factory",
      "C": "A security control that allows or blocks network traffic according to rules",
      "D": "A tool for calibrating sensors",
      "E": "A battery charging controller",
      "F": "A system for storing device photographs",
      "G": "A type of digital certificate",
      "H": "A method for increasing processor speed"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is network segmentation?",
    "options": {
      "A": "Combining every network into one unrestricted segment",
      "B": "Removing all device identities",
      "C": "Sending every packet to every device",
      "D": "Replacing IP addresses with passwords",
      "E": "Dividing a network into zones with controlled communication between them",
      "F": "Storing every device in one database table",
      "G": "Converting network traffic into images",
      "H": "Increasing the physical size of routers"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is a VLAN, and how can it help IoT security?",
    "options": {
      "A": "A type of digital certificate",
      "B": "A physical sensor calibration method",
      "C": "A battery management technique",
      "D": "A virtual storage drive for firmware",
      "E": "A protocol used only for encryption keys",
      "F": "A dashboard design standard",
      "G": "A logical network segment that can help isolate IoT devices",
      "H": "A method for measuring temperature remotely"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What is a Virtual Private Network (VPN)?",
    "options": {
      "A": "A tool that removes the need for authentication",
      "B": "A technology that creates a protected connection across another network",
      "C": "A type of temperature sensor",
      "D": "A method for disabling encryption",
      "E": "A device battery specification",
      "F": "A system for replacing all firewalls",
      "G": "A database query language",
      "H": "A physical network cabinet"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is an Intrusion Detection System (IDS)?",
    "options": {
      "A": "A tool that only measures battery voltage",
      "B": "A system that automatically repairs every hardware fault",
      "C": "A tool for designing application icons",
      "D": "A system that monitors activity for suspicious behavior and raises alerts",
      "E": "A method for increasing sensor range",
      "F": "A protocol for storing photographs",
      "G": "A tool that only creates network cables",
      "H": "A system for increasing cloud storage capacity"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is an Intrusion Prevention System (IPS)?",
    "options": {
      "A": "A system designed to detect and actively block or prevent certain malicious activities",
      "B": "A tool used only to display device temperatures",
      "C": "A method for generating device serial numbers",
      "D": "A physical mounting bracket",
      "E": "A cloud backup schedule",
      "F": "A sensor calibration certificate",
      "G": "A tool that only stores application screenshots",
      "H": "A method for measuring battery age"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is Zero Trust security?",
    "options": {
      "A": "Trusting every device connected to a local network",
      "B": "Giving every user permanent administrator access",
      "C": "Disabling identity verification inside an office",
      "D": "Allowing access without evaluating permissions",
      "E": "Assuming internal traffic is always safe",
      "F": "Avoiding all security logs",
      "G": "Never automatically trusting an entity based only on its network location",
      "H": "Using one shared password for all services"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What is the role of an IoT gateway in network security?",
    "options": {
      "A": "It guarantees that sensors never fail",
      "B": "It can connect networks while applying controls such as filtering, authentication, and protocol translation",
      "C": "It replaces all device firmware",
      "D": "It removes the need for network monitoring",
      "E": "It makes all network traffic publicly readable",
      "F": "It only displays graphs",
      "G": "It prevents every physical attack",
      "H": "It automatically renews all certificates without configuration"
    },
    "correctOption": "B"
  },
  {
    "questionText": "Why should IoT devices be isolated from critical business systems?",
    "options": {
      "A": "To prevent devices from measuring data",
      "B": "To eliminate all network communication",
      "C": "To reduce unauthorized access and limit the spread of a compromise",
      "D": "To make every device use the same password",
      "E": "To prevent authorized maintenance",
      "F": "To disable all monitoring",
      "G": "To remove all access-control rules",
      "H": "To guarantee unlimited bandwidth"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is network monitoring in IoT?",
    "options": {
      "A": "Replacing every network cable daily",
      "B": "Measuring only the physical size of a router",
      "C": "Changing dashboard colors",
      "D": "Disabling device logs",
      "E": "Observing network traffic and device communication for failures or suspicious behavior",
      "F": "Removing every firewall rule",
      "G": "Storing private keys in public logs",
      "H": "Turning off all telemetry"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is the purpose of an access control list (ACL) in an IoT network?",
    "options": {
      "A": "To measure a sensor's accuracy",
      "B": "To increase the number of devices automatically",
      "C": "To encrypt every file without keys",
      "D": "To control which traffic or entities are permitted or denied",
      "E": "To determine the physical size of a gateway",
      "F": "To improve a battery's chemical capacity",
      "G": "To display only temperature graphs",
      "H": "To replace all device identities"
    },
    "correctOption": "D"
  },
  {
    "questionText": "Why should unused network ports and services be disabled?",
    "options": {
      "A": "They can provide unnecessary entry points for attackers",
      "B": "They are required for every security update",
      "C": "They guarantee stronger wireless signals",
      "D": "They automatically encrypt all stored data",
      "E": "They increase sensor accuracy",
      "F": "They prevent administrators from monitoring traffic",
      "G": "They eliminate the need for authentication",
      "H": "They increase cloud storage capacity"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is network hardening?",
    "options": {
      "A": "Making routers physically heavier",
      "B": "Increasing network cable length",
      "C": "Replacing every device with a larger model",
      "D": "Removing all network security rules",
      "E": "Making all ports accessible to everyone",
      "F": "Configuring network devices and services to reduce vulnerabilities and unnecessary exposure",
      "G": "Disabling all network logs",
      "H": "Increasing the number of unused services"
    },
    "correctOption": "F"
  },
  {
    "questionText": "How can network segmentation limit the impact of an IoT attack?",
    "options": {
      "A": "By granting every device access to every network",
      "B": "By disabling all device authentication",
      "C": "By restricting communication between network zones",
      "D": "By making all network traffic public",
      "E": "By removing every firewall",
      "F": "By preventing devices from recording data",
      "G": "By forcing every device to use one password",
      "H": "By removing all monitoring tools"
    },
    "correctOption": "C"
  },
  {
    "questionText": "Why is secure remote access important for IoT administration?",
    "options": {
      "A": "It removes the need for administrators",
      "B": "It allows anyone to control remote devices",
      "C": "It guarantees that no software bug exists",
      "D": "It makes device credentials unnecessary",
      "E": "It prevents all sensor failures",
      "F": "It automatically replaces every firewall",
      "G": "It ensures remote management is restricted to authorized parties",
      "H": "It makes all cloud data public"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What should an IoT network do when suspicious traffic is detected?",
    "options": {
      "A": "Delete all security policies permanently",
      "B": "Alert responsible personnel and investigate, contain, and remediate according to policy",
      "C": "Give the source device administrator access",
      "D": "Disable all logging",
      "E": "Publish private keys for inspection",
      "F": "Ignore the traffic in every case",
      "G": "Remove all device identities",
      "H": "Allow unrestricted communication to every network ## SECTION F — SECURE COMMUNICATION AND PROTOCOLS"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is encryption in IoT communication?",
    "options": {
      "A": "Compressing data so that it takes less storage",
      "B": "Deleting information after transmission",
      "C": "Converting readable data into ciphertext that requires the appropriate key to understand",
      "D": "Replacing sensor values with random measurements",
      "E": "Increasing network bandwidth",
      "F": "Changing device casing material",
      "G": "Removing all message authentication",
      "H": "Turning every message into a photograph"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is the difference between symmetric and asymmetric cryptography?",
    "options": {
      "A": "Both always use the same public key for every operation",
      "B": "Symmetric cryptography never uses keys",
      "C": "Asymmetric cryptography only measures sensor values",
      "D": "Symmetric cryptography uses a shared secret key; asymmetric cryptography uses a public/private key pair",
      "E": "Symmetric cryptography is only a network cable standard",
      "F": "Asymmetric cryptography eliminates the need for key management",
      "G": "Both guarantee security even when keys are exposed",
      "H": "Asymmetric cryptography is a type of battery"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is TLS, and why is it used in IoT?",
    "options": {
      "A": "A method for physically mounting sensors",
      "B": "A tool for increasing battery capacity",
      "C": "A format for storing photographs",
      "D": "A technique for changing a device's serial number",
      "E": "A transport security protocol that can provide confidentiality, integrity, and authentication",
      "F": "A system for measuring temperature only",
      "G": "A protocol for deleting every network log",
      "H": "A method for replacing all application code"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is mutual TLS (mTLS)?",
    "options": {
      "A": "A TLS configuration in which both client and server authenticate using certificates",
      "B": "A method in which neither party checks identity",
      "C": "A technique for sending private keys publicly",
      "D": "A system that disables all encryption",
      "E": "A sensor calibration protocol",
      "F": "A method for measuring network cable length",
      "G": "A battery charging procedure",
      "H": "A type of cloud storage file"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is MQTT?",
    "options": {
      "A": "A hardware component used to measure pressure",
      "B": "A database backup format",
      "C": "A protocol used only for digital certificates",
      "D": "A physical connector for sensor wiring",
      "E": "A programming language for dashboards",
      "F": "A lightweight publish/subscribe messaging protocol commonly used in IoT",
      "G": "A tool for manufacturing circuit boards",
      "H": "A method for calibrating cameras"
    },
    "correctOption": "F"
  },
  {
    "questionText": "Why should MQTT communication be secured?",
    "options": {
      "A": "To increase the physical weight of the broker",
      "B": "To prevent unauthorized publishing, subscribing, interception, and tampering",
      "C": "To remove the need for device identities",
      "D": "To make all topics publicly accessible",
      "E": "To guarantee unlimited message delivery",
      "F": "To replace every sensor with cloud software",
      "G": "To prevent all device updates",
      "H": "To eliminate network configuration"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is the difference between HTTP and HTTPS?",
    "options": {
      "A": "HTTP always uses certificates while HTTPS never does",
      "B": "HTTPS is used only for sensor calibration",
      "C": "HTTP is a database; HTTPS is a physical gateway",
      "D": "HTTPS removes the need for a server",
      "E": "HTTP cannot transfer data",
      "F": "HTTP and HTTPS are identical in every security respect",
      "G": "HTTPS uses HTTP over TLS to protect the connection",
      "H": "HTTPS is a type of battery"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What is a cryptographic hash function?",
    "options": {
      "A": "A tool for increasing a device's wireless range",
      "B": "A process that encrypts all data reversibly with a public key",
      "C": "A function that maps input data to a fixed-length digest",
      "D": "A system for assigning network addresses",
      "E": "A technique for calibrating pressure sensors",
      "F": "A method for increasing processor temperature",
      "G": "A file format for dashboards",
      "H": "A physical security enclosure"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is a digital signature?",
    "options": {
      "A": "A handwritten name stored in an image",
      "B": "A password shared between all devices",
      "C": "A certificate's validity date",
      "D": "A cryptographic value created with a private key and verified with the corresponding public key",
      "E": "A device's printed serial number",
      "F": "A physical seal on a sensor",
      "G": "A network address assigned by DHCP",
      "H": "A dashboard notification sound"
    },
    "correctOption": "D"
  },
  {
    "questionText": "Why should sensitive IoT data be encrypted in transit?",
    "options": {
      "A": "To reduce the chance that network observers can read the data",
      "B": "To increase the physical size of a sensor",
      "C": "To remove the need for device authentication",
      "D": "To make every message publicly readable",
      "E": "To prevent all hardware failures",
      "F": "To eliminate the need for secure storage",
      "G": "To increase the number of network ports",
      "H": "To make data impossible for its authorized recipient to read"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is secure key management?",
    "options": {
      "A": "Publishing all keys on a public website",
      "B": "Using one permanent key without access controls",
      "C": "Storing private keys in plain-text logs",
      "D": "Sharing all secret keys through unprotected messages",
      "E": "The secure generation, distribution, storage, rotation, use, and retirement of cryptographic keys",
      "F": "Deleting every certificate without replacement",
      "G": "Disabling all encryption",
      "H": "Printing private keys on device labels"
    },
    "correctOption": "E"
  },
  {
    "questionText": "Why is certificate validation important when establishing a secure connection?",
    "options": {
      "A": "It automatically increases network speed",
      "B": "It verifies the physical dimensions of a device",
      "C": "It helps confirm that the certificate is trusted, valid, and appropriate for the intended identity",
      "D": "It makes all software bug-free",
      "E": "It removes the need for encryption",
      "F": "It increases battery capacity",
      "G": "It guarantees that a server can never be compromised",
      "H": "It replaces all access-control policies ## SECTION G — IoT SYSTEM DESIGN AND REQUIREMENTS"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is the first step in designing an IoT system?",
    "options": {
      "A": "Buy the most expensive sensor available",
      "B": "Select a cloud provider without analysis",
      "C": "Start writing code before identifying the need",
      "D": "Purchase all hardware components immediately",
      "E": "Create a dashboard without defining its purpose",
      "F": "Clearly understand and define the problem to be solved",
      "G": "Deploy devices before testing",
      "H": "Choose a device enclosure color"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What are functional requirements in IoT system design?",
    "options": {
      "A": "Requirements describing the physical appearance of a product only",
      "B": "Requirements describing what the system must do",
      "C": "Requirements that only specify the project's budget",
      "D": "Requirements that only describe the building location",
      "E": "Requirements that list employee names",
      "F": "Requirements that specify marketing slogans",
      "G": "Requirements that only describe hardware packaging",
      "H": "Requirements that prohibit system testing"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What are non-functional requirements?",
    "options": {
      "A": "A list of sensor brands only",
      "B": "A list of device colors",
      "C": "A list of employee responsibilities only",
      "D": "Requirements describing qualities or constraints such as performance, security, reliability, and scalability",
      "E": "A list of dashboard titles",
      "F": "A list of unrelated images",
      "G": "A list of physical addresses only",
      "H": "A list of project slogans"
    },
    "correctOption": "D"
  },
  {
    "questionText": "Why must sensors be selected according to the problem requirements?",
    "options": {
      "A": "Every sensor measures every physical quantity equally well",
      "B": "Sensor selection only affects the device's color",
      "C": "Sensors never have measurement limits",
      "D": "Every sensor works in all environments",
      "E": "Sensor choice determines the application's logo",
      "F": "Sensors do not require power",
      "G": "The sensor must suit the required quantity, range, accuracy, and environment",
      "H": "Sensor selection eliminates the need for testing"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What factors should be considered when choosing a sensor's placement?",
    "options": {
      "A": "Only the device's paint color",
      "B": "Only the brand of the cloud service",
      "C": "Target measurement, environment, coverage, accessibility, safety, and communication conditions",
      "D": "Only the application's font",
      "E": "Only the number of dashboard buttons",
      "F": "Only the office furniture layout",
      "G": "Only the device's purchase invoice",
      "H": "Only the names of system administrators"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is sampling frequency in an IoT system?",
    "options": {
      "A": "The number of users logged into a dashboard",
      "B": "The number of network routers in a building",
      "C": "The number of certificates issued each year",
      "D": "The amount of storage purchased",
      "E": "How often a sensor measures or records a value",
      "F": "The number of device enclosures manufactured",
      "G": "The number of software developers assigned",
      "H": "The number of physical buttons on a gateway"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is an actuator in an IoT system?",
    "options": {
      "A": "A component that performs a physical action in response to a control signal",
      "B": "A database used only for storing images",
      "C": "A certificate issued by a CA",
      "D": "A tool for measuring internet subscription cost",
      "E": "A dashboard color palette",
      "F": "A network protocol used only for email",
      "G": "A component that only displays historical charts",
      "H": "A document describing security policies"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is the purpose of an IoT system architecture diagram?",
    "options": {
      "A": "To list employee attendance",
      "B": "To display product advertisements",
      "C": "To show only the device's outer appearance",
      "D": "To calculate staff salaries",
      "E": "To replace all system tests",
      "F": "To show components, connections, and data or command flows",
      "G": "To list unrelated programming languages",
      "H": "To show only the product's selling price"
    },
    "correctOption": "F"
  },
  {
    "questionText": "Why should requirements be defined before implementation?",
    "options": {
      "A": "To avoid documenting the project",
      "B": "To ensure no testing is ever required",
      "C": "To guide design decisions and provide criteria for testing and acceptance",
      "D": "To guarantee that no hardware will fail",
      "E": "To prevent users from providing feedback",
      "F": "To avoid selecting suitable sensors",
      "G": "To remove all performance constraints",
      "H": "To ensure the system has no interfaces"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is a prototype in IoT system development?",
    "options": {
      "A": "A final product that never needs testing",
      "B": "An early working model used to test key design assumptions and functionality",
      "C": "A list of possible product names",
      "D": "A certificate authority",
      "E": "A permanent replacement for the production system",
      "F": "A network firewall rule",
      "G": "A database password",
      "H": "A marketing presentation only"
    },
    "correctOption": "B"
  },
  {
    "questionText": "Why should power consumption be considered when designing an IoT device?",
    "options": {
      "A": "It determines the device's logo",
      "B": "It guarantees that a sensor is accurate",
      "C": "It eliminates all network latency",
      "D": "It affects battery life, operating cost, maintenance, and deployment feasibility",
      "E": "It removes the need for firmware",
      "F": "It guarantees unlimited wireless range",
      "G": "It makes authentication unnecessary",
      "H": "It prevents every physical attack"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is scalability in IoT system design?",
    "options": {
      "A": "The ability to operate without any software",
      "B": "The ability to increase the size of a device enclosure",
      "C": "The ability to use only one sensor forever",
      "D": "The ability to prevent all maintenance",
      "E": "The ability to function without power",
      "F": "The ability to display only one measurement",
      "G": "The ability to handle growth in devices, data, users, or workload",
      "H": "The ability to avoid all network connections"
    },
    "correctOption": "G"
  },
  {
    "questionText": "What is reliability in an IoT system?",
    "options": {
      "A": "The ability to perform intended functions consistently under specified conditions",
      "B": "The ability to change dashboard colors",
      "C": "The ability to make every device physically identical",
      "D": "The ability to operate without requirements",
      "E": "The ability to avoid all monitoring",
      "F": "The ability to eliminate every possible fault permanently",
      "G": "The ability to store only one reading",
      "H": "The ability to connect only during installation"
    },
    "correctOption": "A"
  },
  {
    "questionText": "Why is testing important before deploying an IoT system?",
    "options": {
      "A": "It removes the need to document the design",
      "B": "It guarantees that no future update is needed",
      "C": "It verifies functionality, performance, reliability, security, and failure behavior",
      "D": "It replaces all maintenance activities",
      "E": "It ensures that every sensor produces identical readings",
      "F": "It eliminates the need for user training",
      "G": "It prevents all changes to requirements",
      "H": "It guarantees that network connectivity never fails ## SECTION H — IoT ARCHITECTURE, CLOUD, AND APPLICATIONS"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What are common layers of an IoT architecture?",
    "options": {
      "A": "Keyboard, mouse, monitor, printer",
      "B": "Billing, payroll, advertising, sales",
      "C": "Painting, packaging, shipping, branding",
      "D": "Browser, spreadsheet, slideshow, email",
      "E": "Perception/device, network/communication, and application layers",
      "F": "Keyboard, battery, enclosure, stand",
      "G": "Invoice, receipt, calendar, contact list",
      "H": "Photo, audio, video, animation"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is the role of the perception layer in IoT?",
    "options": {
      "A": "It manages employee salaries",
      "B": "It designs marketing materials",
      "C": "It handles only certificate revocation",
      "D": "It collects information from the physical environment through sensors and devices",
      "E": "It replaces every cloud service",
      "F": "It manages only user interface colors",
      "G": "It calculates only monthly billing",
      "H": "It controls only application fonts"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is the role of the network layer in IoT?",
    "options": {
      "A": "It physically manufactures sensors",
      "B": "It transfers data and commands between devices, gateways, processing systems, and applications",
      "C": "It designs the device enclosure",
      "D": "It determines employee leave policies",
      "E": "It prints device labels",
      "F": "It selects marketing slogans",
      "G": "It replaces all sensors with documents",
      "H": "It performs only spreadsheet formatting"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is the role of the application layer in IoT?",
    "options": {
      "A": "It only supplies electrical power to sensors",
      "B": "It manufactures device circuit boards",
      "C": "It provides user-facing services such as dashboards, alerts, reports, and controls",
      "D": "It replaces the network with physical cables only",
      "E": "It manages only device packaging",
      "F": "It measures only battery chemistry",
      "G": "It issues all physical warranties",
      "H": "It handles only warehouse invoices"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is edge computing in IoT?",
    "options": {
      "A": "Processing data near the device or where it is generated",
      "B": "Storing all data exclusively on a distant server",
      "C": "Disabling local device processing",
      "D": "Replacing sensors with dashboards",
      "E": "Sending every reading to a printer",
      "F": "Eliminating all network interfaces",
      "G": "Processing data only after the device is retired",
      "H": "Using a physical edge of a circuit board to store data"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is the role of cloud computing in IoT?",
    "options": {
      "A": "It physically replaces every sensor",
      "B": "It guarantees that internet connectivity never fails",
      "C": "It eliminates the need for access control",
      "D": "It makes device management unnecessary",
      "E": "It provides centralized storage, processing, device management, analytics, and application services",
      "F": "It prevents all possible cyberattacks automatically",
      "G": "It makes every device operate without electricity",
      "H": "It replaces every local safety mechanism"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is the difference between edge computing and cloud computing?",
    "options": {
      "A": "Edge computing always requires a distant data center; cloud computing never does",
      "B": "Edge computing is only for photographs; cloud computing is only for audio",
      "C": "Both terms refer only to physical sensor mounting",
      "D": "Edge computing cannot process data",
      "E": "Cloud computing always works without connectivity",
      "F": "Edge processes data near its source; cloud computing uses remote centralized infrastructure",
      "G": "Edge computing is a type of digital certificate",
      "H": "Cloud computing is a physical network cable"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What is an IoT dashboard?",
    "options": {
      "A": "A hardware component that measures pressure",
      "B": "A user interface presenting device status, measurements, trends, alerts, or controls",
      "C": "A method for generating private keys",
      "D": "A physical security enclosure",
      "E": "A network cable testing device",
      "F": "A firmware signature algorithm",
      "G": "A battery chemistry standard",
      "H": "A device's manufacturing invoice"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is telemetry in IoT?",
    "options": {
      "A": "A physical method for mounting antennas",
      "B": "A process for changing device casing colors",
      "C": "The automated collection and transmission of measurements or status information from remote devices",
      "D": "A system for creating employee accounts only",
      "E": "A technique for printing network diagrams",
      "F": "A method for replacing sensor batteries",
      "G": "A process for deleting every historical reading",
      "H": "A method for generating product advertisements"
    },
    "correctOption": "C"
  },
  {
    "questionText": "Why is data storage important in an IoT system?",
    "options": {
      "A": "It makes all sensor readings automatically correct",
      "B": "It replaces all device authentication",
      "C": "It prevents every power failure",
      "D": "It preserves readings and events for monitoring, analysis, reporting, and auditing",
      "E": "It guarantees unlimited network speed",
      "F": "It removes the need for data privacy",
      "G": "It makes every device operate without maintenance",
      "H": "It replaces the need for sensor calibration"
    },
    "correctOption": "D"
  },
  {
    "questionText": "What is an API in an IoT application?",
    "options": {
      "A": "A physical actuator",
      "B": "A battery charging system",
      "C": "A type of network firewall",
      "D": "A sensor calibration certificate",
      "E": "An Application Programming Interface defining how software components exchange data or request functions",
      "F": "A device enclosure",
      "G": "A cryptographic private key",
      "H": "A type of electrical connector"
    },
    "correctOption": "E"
  },
  {
    "questionText": "What is real-time monitoring in IoT?",
    "options": {
      "A": "Observing device data and conditions with sufficiently low delay for the intended use",
      "B": "Reviewing device data only once every ten years",
      "C": "Displaying data without any timestamps",
      "D": "Deleting readings as soon as they arrive",
      "E": "Preventing sensors from transmitting data",
      "F": "Collecting only device photographs",
      "G": "Monitoring only the physical casing",
      "H": "Updating the dashboard only when the device is retired"
    },
    "correctOption": "A"
  },
  {
    "questionText": "What is data analytics in IoT?",
    "options": {
      "A": "Replacing sensors with larger screens",
      "B": "Increasing network cable length",
      "C": "Physically cleaning device enclosures",
      "D": "Printing every measurement on paper",
      "E": "Disabling all historical data",
      "F": "Examining IoT data to identify patterns, trends, anomalies, or useful insights",
      "G": "Removing all timestamps",
      "H": "Changing device colors"
    },
    "correctOption": "F"
  },
  {
    "questionText": "What is predictive maintenance in IoT?",
    "options": {
      "A": "Replacing every device at the same fixed time regardless of condition",
      "B": "Using equipment data and analysis to estimate when maintenance may be needed",
      "C": "Waiting until every machine has failed before taking action",
      "D": "Disabling equipment monitoring",
      "E": "Removing all maintenance records",
      "F": "Replacing sensors with paper forms",
      "G": "Ignoring changes in equipment condition",
      "H": "Updating dashboard colors before maintenance"
    },
    "correctOption": "B"
  },
  {
    "questionText": "What is interoperability in IoT?",
    "options": {
      "A": "The ability to prevent devices from communicating",
      "B": "The ability to make every device use identical hardware",
      "C": "The ability to store all data in one image",
      "D": "The ability to exchange information and work together across different devices or systems",
      "E": "The ability to remove all network protocols",
      "F": "The ability to use only one vendor forever",
      "G": "The ability to operate without data formats",
      "H": "The ability to prevent software integration"
    },
    "correctOption": "D"
  },
  {
    "questionText": "Why is data privacy important in IoT applications?",
    "options": {
      "A": "It guarantees that devices never need updates",
      "B": "It makes all collected data public",
      "C": "IoT data may reveal personal activities, locations, health details, or business operations",
      "D": "It removes the need for data retention rules",
      "E": "It guarantees perfect sensor accuracy",
      "F": "It eliminates all network traffic",
      "G": "It replaces all user authentication",
      "H": "It prevents devices from collecting any data in every case"
    },
    "correctOption": "C"
  },
  {
    "questionText": "What is device management in an IoT platform?",
    "options": {
      "A": "Designing only the device's logo",
      "B": "Measuring only room temperature",
      "C": "Creating marketing brochures",
      "D": "Physically cleaning devices every hour",
      "E": "Replacing every cloud service with a sensor",
      "F": "Managing only employee attendance",
      "G": "Registering, configuring, monitoring, updating, and retiring connected devices",
      "H": "Generating only product invoices"
    },
    "correctOption": "G"
  },
  {
    "questionText": "Why should cloud-based IoT applications use access control?",
    "options": {
      "A": "To ensure users and services access only permitted resources and operations",
      "B": "To make every record publicly accessible",
      "C": "To eliminate all user roles",
      "D": "To prevent all authorized maintenance",
      "E": "To make private data visible to everyone",
      "F": "To remove authentication from administrative functions",
      "G": "To guarantee that software never has vulnerabilities",
      "H": "To eliminate the need for security monitoring ## SECTION I — APPLIED SECURITY AND DESIGN ANALYSIS"
    },
    "correctOption": "A"
  },
  {
    "questionText": "A smart factory sensor sends readings to a cloud dashboard. Which set contains three appropriate security measures?",
    "options": {
      "A": "Larger screen, brighter display, heavier enclosure",
      "B": "Device authentication, encrypted communication, and access control",
      "C": "More dashboard colors, extra buttons, larger icons",
      "D": "Higher sampling rate, longer cables, bigger battery only",
      "E": "Public credentials, unrestricted access, disabled logging",
      "F": "Shared passwords, open ports, unverified firmware",
      "G": "No identity checks, no encryption, no access restrictions",
      "H": "Public private keys, open network access, disabled updates"
    },
    "correctOption": "B"
  },
  {
    "questionText": "A smart water tank sends an alert when the water level is high. What should be considered in the design?",
    "options": {
      "A": "Only the dashboard background color",
      "B": "Only the price of the device enclosure",
      "C": "Only the number of buttons on the mobile application",
      "D": "Only the brand name of the cloud service",
      "E": "Only the length of the power cable",
      "F": "Sensor accuracy and placement, sampling, communication, thresholds, and safe failure behavior",
      "G": "Only the font size used in the alert",
      "H": "Only the color of the water tank"
    },
    "correctOption": "F"
  },
  {
    "questionText": "A factory's IoT devices share a network with office computers. What is an important security improvement?",
    "options": {
      "A": "Give all devices unrestricted access to every office computer",
      "B": "Disable all network monitoring",
      "C": "Use one shared administrator password",
      "D": "Segment the IoT devices and restrict traffic between network zones",
      "E": "Publish all device credentials",
      "F": "Disable every firewall",
      "G": "Allow all incoming connections",
      "H": "Remove device authentication"
    },
    "correctOption": "D"
  },
  {
    "questionText": "An IoT device continues using outdated firmware with a known vulnerability. What should the administrator do?",
    "options": {
      "A": "Ignore the vulnerability permanently",
      "B": "Disable every security control",
      "C": "Publish the device's private keys",
      "D": "Allow unrestricted remote access",
      "E": "Assess the risk, deploy a trusted verified update safely, and confirm protection",
      "F": "Remove all device logs",
      "G": "Share the administrator password publicly",
      "H": "Disable all monitoring and maintenance"
    },
    "correctOption": "E"
  },
  {
    "questionText": "A device accepts commands from any sender on the local network. What is the main security problem and an appropriate remedy?",
    "options": {
      "A": "Insufficient authentication and authorization; verify identities and restrict command permissions",
      "B": "Too many dashboard colors; reduce the color palette",
      "C": "Low screen brightness; increase display brightness",
      "D": "Excessive battery capacity; replace the battery",
      "E": "Too much data storage; delete all data",
      "F": "Incorrect enclosure shape; redesign the casing",
      "G": "Excessive sensor accuracy; reduce the sampling rate",
      "H": "Too many device labels; remove every label"
    },
    "correctOption": "A"
  },
  {
    "questionText": "An IoT system must keep operating when its internet connection fails. Which design measures are appropriate?",
    "options": {
      "A": "Depend entirely on a continuous cloud connection",
      "B": "Disable all local processing",
      "C": "Delete readings whenever connectivity is lost",
      "D": "Prevent devices from storing any data locally",
      "E": "Stop every local function immediately",
      "F": "Require all decisions to be made by a distant server",
      "G": "Use local edge processing and suitable fallback behavior or data buffering",
      "H": "Remove all offline operating procedures"
    },
    "correctOption": "G"
  },
  {
    "questionText": "A temperature sensor sends unusually high readings that trigger unnecessary alarms. What should be checked?",
    "options": {
      "A": "Only the color of the dashboard",
      "B": "Sensor calibration and condition, placement, data validation, communication integrity, and alert thresholds",
      "C": "Only the name of the cloud provider",
      "D": "Only the physical size of the room",
      "E": "Only the font used in notifications",
      "F": "Only the device's marketing label",
      "G": "Only the number of user accounts",
      "H": "Only the color of the sensor enclosure"
    },
    "correctOption": "B"
  },
  {
    "questionText": "An administrator discovers that an IoT device's private key may have been exposed. What should be done?",
    "options": {
      "A": "Publish the key to confirm the exposure",
      "B": "Continue using the key permanently without investigation",
      "C": "Disable certificate validation",
      "D": "Replace all passwords with the exposed key",
      "E": "Ignore all related alerts",
      "F": "Revoke or disable the affected identity, provision a new key securely, investigate, and monitor for misuse",
      "G": "Give every device the same replacement key without controls",
      "H": "Store the exposed key in a public log"
    },
    "correctOption": "F"
  },
  {
    "questionText": "Why should an IoT system log security-related events?",
    "options": {
      "A": "To make all private information public",
      "B": "To replace every access-control mechanism",
      "C": "To increase the physical size of devices",
      "D": "To help detect suspicious activity, investigate incidents, and establish what happened",
      "E": "To eliminate all software testing",
      "F": "To guarantee that attacks never occur",
      "G": "To replace sensor calibration",
      "H": "To prevent all future maintenance"
    },
    "correctOption": "D"
  },
  {
    "questionText": "A company wants to deploy thousands of IoT devices across multiple locations. Which two design considerations are important?",
    "options": {
      "A": "Identical dashboard colors and larger device labels",
      "B": "Public credentials and unrestricted network access",
      "C": "Scalable device management and secure provisioning",
      "D": "Disabling firmware updates and monitoring",
      "E": "Using one shared identity for every device without controls",
      "F": "Avoiding all device inventory records",
      "G": "Removing authentication from gateways",
      "H": "Storing private keys in public files"
    },
    "correctOption": "C"
  },
  {
    "questionText": "How should an IoT system protect data from a sensor to a cloud application?",
    "options": {
      "A": "Secure only the dashboard's visual appearance",
      "B": "Allow all network traffic without verification",
      "C": "Use one public password for every device",
      "D": "Disable encryption to simplify communication",
      "E": "Store all private keys in plain text",
      "F": "Ignore identity checks between components",
      "G": "Secure only the sensor while leaving the rest unprotected",
      "H": "Use device identity and authentication, protected communication, access control, secure storage, and monitoring"
    },
    "correctOption": "H"
  }
];
