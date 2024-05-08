<H1 center>Python Script Comparisons</h1>

## <center>Overview</center>
This folder contains multiple Python scripts that demonstrate different methods to achieve the same functionality. Each script is an implementation of **Automated Call Auditing System**, designed to show alternative approaches and their respective advantages and disadvantages.

## <center>Files</center>
Here, we describe each script, the method it uses, and its main characteristics.

### [NCAT.py](Call_Audit/NCAT.py)
- **Method**: Azure OpenAI direct integration.
- **Pros**: Easy to setup.
- **Cons**: Lacks integration with Portkey.ai

### [NCAT_Assistant.py](Call_Audit/NCAT_Assistant.py)
- **Method**: Azure OpenAI Assistant
- **Pros**: Easier file calling post setting up a thread id for the assistant. Integration with Portkey.ai for tracking usage.
- **Cons**: Assistants in Beta phase and hence not reliable for now.

### [NCAT_Portkey.py](Call_Audit/NCAT_Portkey.py)
- **Method**: Azure OpenAI Fine Tuned model working with Portkey.ai to track token utilization and have semantic caching.
- **Pros**: Token Usage tracking using Portkey.ai
- **Cons**: Fine Tuned model hosted on Azure leading to high hosting costs.

### [NCAT_Portkey_OpenAI.py](Call_Audit/NCAT_PortKey_OpenAI.py)
- **Method**: OpenAI Fine Tuned model working with Portkey.ai to track token utilization.
- **Pros**: Token Usage tracking using Portkey.ai. Logging options to monitor script performance. Complete script setup with variable directories to ensure easy integration and proper documentation for setting up the system.
- **Cons**: None identified as of now.

## <center>License</center>
This project is licensed under the Apache License - see the [LICENSE](LICENSE.md) file for details.
