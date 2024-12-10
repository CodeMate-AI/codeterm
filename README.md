
# CodeMate AI Terminal

**Version**: 0.0.1  
**Product Name**: CodeTerm  
**Description**: An open-source AI powered terminal for the next-gen developers to master command line on Day one.

## Introduction

CodeTerm is an open-source terminal designed to enhance the command-line interface (CLI) experience with context-driven AI integration. It includes essential features such as integrated terminal with Natural language to command functionality, directory navigation, a built-in code/text editor, and AI-powered chat to generate code snippets with preview compoment. By leveraging the efficiency of the CLI alongside the intelligence of AI, CodeTerm offers a unified environment where users can seamlessly execute text-based commands and receive dynamic, context-aware assistance.

CodeTerm is a revolutionary terminal that redefines how we interact with command-line interfaces. Traditionally, there’s been a clear distinction between the speed and efficiency of the CLI and the need for custom themes, copy/paste functionality, scrolling, and adjustable fonts, which often require separate web-based tools. CodeTerm eliminates this by merging the best features of both CLI and graphical based interfaces into one cohesive, AI powered terminal, providing a seamless experience that caters to all your command-line and graphical needs.


## Installation

CodeTerm Terminal works on macOS and Linux .
You can also install CodeTerm Terminal directly from: [cli.codemate.ai/download](https://cli.codemate.ai/download).



## Getting Started For Development

To get started with CodeTerm, follow these steps:

### For MacOS Users:

1. **Clone the Repository**:

First, clone the CodeTerm repository to your local machine using the following command:

```sh
git clone https://github.com/CodeMate-AI/codeterm.git
cd codeterm
```

2. **Install the dependencies**:

Tnstall the required dependencies by running the command:

```sh
npm install
```

3. **Grant executable permissions to the backend executable file:**

```sh
cd backend/dist/macOS/
```

```sh
chmod +x ./mainSave
```

```sh
cd ../../../
```

4. **Usage**:

To run CodeTerm in development mode, use the following command:

```sh
npm run dev
```


### For Linux Users:

1. **Clone the Repository**:

First, clone the CodeTerm repository to your local machine using the following command:

```sh
git clone https://github.com/CodeMate-AI/codeterm.git
cd codeterm
```

2. **Install the dependencies**:

Tnstall the required dependencies by running the command:

```sh
npm install
```

3. **Grant executable permissions to the backend executable file:**

```sh
cd backend/dist/linux/
```

```sh
chmod +x ./mainSave
```

```sh
cd ../../../
```

4. **Usage**:

To run CodeTerm in development mode, use the following command:

```sh
npm run dev
```


## Getting Started For Production

### For Ubuntu Users:
You can choose between the .deb package or the .AppImage package to install and run the application.


#### Option 1: Using the .deb Package

1. **Install the .deb package** by double-clicking the file or using the following command in the terminal:
```sh
sudo dpkg -i path/to/CodeTerm_0.0.1_amd64.deb
```
2. After installation, you can simply launch the application from your applications menu or by typing the application name in the terminal.


#### Option 2: Using the .AppImage Package

1. **Navigate to the directory** where the .AppImage was downloaded:
```sh
cd /path/to/downloaded/file
```
2. **Make the AppImage executable** with the following command:
```sh
chmod +x ./CodeTerm-0.0.1.AppImage
```
3. **Run the application** by executing:
```sh
./CodeTerm-0.0.1.AppImage
```


### For macOS Users:

#### Troubleshooting macOS "App is Damaged" Error

If you encounter an error on macOS stating that the app is "damaged and can't be opened" when attempting to open a `.dmg` file, follow these steps to resolve it.


1. **Disable Gatekeeper (if needed)**:

Gatekeeper may block the app from running. To temporarily disable Gatekeeper, run the following command in your terminal:

```sh
sudo spctl --master-disable
```

2. **Remove Extended Attributes**:

Use the following command to remove the quarantine flag:

```sh
sudo xattr -rd com.apple.quarantine /path/to/your/app.dmg
```


### Minimum requirements

CodeTerm Terminal and WSH run on the following platforms:

- macOS 11 or later (arm64, x64)
- Linux based on glibc-2.28 or later (Debian 10, RHEL 8, Ubuntu 20.04, etc.) (arm64, x64)

## Links

- Homepage &mdash; https://cli.codemate.ai/
- Download Page &mdash; https://cli.codemate.ai/download
- Documentation &mdash; https://docs.codemate.ai/


## Contributing

CodeTerm uses GitHub Issues for issue tracking.

Find more information in our [Contributions Guide](CONTRIBUTING.md), which includes:


## Author

**Command Line Inc**  
Email: [contact@codemate.ai](mailto:contact@codemate.ai)

## License

CodeTerm Terminal is licensed under the Apache-2.0 License.