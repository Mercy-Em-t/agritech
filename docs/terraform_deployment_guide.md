# Step-by-Step Terraform Deployment Guide

Running `terraform apply` is incredibly powerful, but because it interacts directly with your real AWS account, you need to set up a few prerequisites on your computer first. 

Follow this step-by-step guide to take CoinOS from your local machine to the live AWS Cloud.

---

## Part 1: The Prerequisites

### 1. Install the AWS Command Line Interface (CLI)
Terraform needs a way to securely talk to AWS. The AWS CLI handles this authentication.
- **Action:** Download and run the official AWS CLI installer for Windows: [AWS CLI for Windows](https://awscli.amazonaws.com/AWSCLIV2.msi)
- **Verify:** Open PowerShell and type `aws --version`. It should return the installed version.

### 2. Configure your AWS Credentials
You need to tell the AWS CLI *who* you are. Log into the AWS Console, go to **IAM (Identity and Access Management)**, and create an Access Key for your user.
- **Action:** Open your terminal and type:
  ```powershell
  aws configure
  ```
- **Inputs:** It will prompt you for four things:
  1. `AWS Access Key ID`: (Paste the key you generated)
  2. `AWS Secret Access Key`: (Paste the secret key)
  3. `Default region name`: Type `eu-west-1` (This is the region we hardcoded in `main.tf`).
  4. `Default output format`: Type `json`.

### 3. Install Terraform
- **Action:** Download the Windows executable from [HashiCorp's Website](https://developer.hashicorp.com/terraform/install).
- Extract the `terraform.exe` file and place it in a safe directory (e.g., `C:\Terraform`).
- **Add to PATH:** Search "Environment Variables" in your Windows Start menu, edit the System `PATH` variable, and add the folder path where you placed `terraform.exe`.
- **Verify:** Restart your terminal and type `terraform --version`.

---

## Part 2: Deploying the Infrastructure

Now that your computer has the tools and the security keys, you can deploy the CoinOS platform.

### Step 1: Navigate to the Configuration
Open your terminal and change directories into the folder where we generated the `main.tf` script.
```powershell
cd C:\Users\LIZBETH\Desktop\agritech\infrastructure
```

### Step 2: Initialize Terraform (`terraform init`)
This command looks at your `main.tf` file and downloads the specific AWS plugins needed to communicate with the cloud. You only need to run this once.
```powershell
terraform init
```

### Step 3: Preview the Architecture (`terraform plan`)
Before spending any money or changing any servers, Terraform will show you exactly what it is about to do.
```powershell
terraform plan
```
> **What to look for:** It will output a long list with `+ create` next to resources like the Aurora Database and MSK Cluster. Check the bottom for the summary (e.g., `Plan: 8 to add, 0 to change, 0 to destroy`).

### Step 4: Execute the Deployment (`terraform apply`)
This is the command that actually builds the cloud! 
```powershell
terraform apply
```
Terraform will ask for confirmation. Type `yes` and press Enter. 

> [!WARNING]
> It will take several minutes to run as AWS spins up enterprise databases and Kafka clusters in the background. Once it finishes, your production infrastructure is officially live!

---

## Part 3: Teardown (Crucial Step)

> [!CAUTION]
> Aurora Serverless and MSK clusters **cost real money** per hour while they are running. Do not leave them running overnight if you are just testing!

When you are finished testing the CoinOS architecture, you can instantly tear down every single server and database to stop the billing cycle.

```powershell
terraform destroy
```
Type `yes` to confirm, and Terraform will meticulously delete every resource it previously created.
