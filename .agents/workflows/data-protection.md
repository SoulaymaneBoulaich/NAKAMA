---
description: 
---

The agent MUST ensure:

Input Sanitization

Remove/encode HTML tags from user input
Strip dangerous characters
Normalize Unicode characters
Limit input length


Output Encoding

HTML encode for HTML context
JavaScript encode for JS context
URL encode for URL parameters
SQL escape for database queries


Data Storage

Encrypt sensitive data at rest
Hash passwords with strong algorithms
Never store plaintext passwords
Implement proper key management


Data Transmission

Use HTTPS for all communications
Implement proper TLS configuration
Validate SSL certificates
Use secure WebSocket connections