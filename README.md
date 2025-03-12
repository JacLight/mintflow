# MintFlow

MintFlow is an AI-first workflow automation platform that combines the power of visual workflow building with conversational AI interfaces. Built for developers and no-code users alike, MintFlow makes it easy to create, deploy, and manage automated workflows while leveraging the latest in AI capabilities.

![MintFlow Logo](link-to-your-logo.png)

## ✨ Key Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating complex automation workflows
- **AI-Powered Chat Interface**: Natural language interaction for workflow creation and management
- **Built-in AI Tools**: Pre-configured LLM nodes for text generation, summarization, and analysis
- **Custom AI Model Integration**: Support for OpenAI, Anthropic, and other LLM providers
- **Extensible Node System**: Create and share custom nodes for specific use cases
- **Real-time Workflow Monitoring**: Track execution status and performance metrics
- **Version Control**: Built-in workflow versioning and rollback capabilities
- **Team Collaboration**: Share workflows and collaborate with team members
- **API-First Design**: RESTful API for programmatic workflow management
- **Enterprise Security**: Role-based access control and audit logging

## 🚀 Getting Started

### Installation

```bash
# Using npm
npm install mintflow

# Using Docker
docker pull mintflow/mintflow
docker run -p 3000:3000 mintflow/mintflow
```

### Quick Start

1. Start the MintFlow server:

```bash
mintflow start
```

2. Open your browser and navigate to `http://localhost:3000`

3. Create your first workflow using the visual editor or chat interface:

```
You: Create a workflow that monitors my Gmail and sends Slack notifications for important emails
MintFlow: I'll help you create that workflow. Let's start with the Gmail trigger node...
```

## 💡 Example Workflows

### Email Processing Pipeline

```javascript
// workflow.json
{
  "name": "Email Processing",
  "trigger": "gmail.newEmail",
  "nodes": [
    {
      "type": "ai.classify",
      "config": {
        "model": "gpt-4",
        "prompt": "Classify email importance..."
      }
    },
    {
      "type": "slack.sendMessage",
      "config": {
        "channel": "#notifications"
      }
    }
  ]
}
```

### Content Generation

```javascript
// workflow.json
{
  "name": "Blog Post Generator",
  "trigger": "schedule.daily",
  "nodes": [
    {
      "type": "ai.generate",
      "config": {
        "template": "Write a blog post about {{topic}}"
      }
    },
    {
      "type": "wordpress.publish"
    }
  ]
}
```

## 🎯 Use Cases

- **Customer Support Automation**: Route and respond to support tickets using AI
- **Content Generation**: Automate content creation and publishing workflows
- **Data Processing**: Extract, transform, and analyze data with AI assistance
- **Sales & Marketing**: Automate lead qualification and engagement
- **HR & Recruitment**: Streamline candidate screening and onboarding
- **Document Processing**: Intelligent document parsing and routing

## 🔧 Architecture

MintFlow follows a modular architecture:

- **Frontend**: React-based interface with real-time updates
- **Backend**: Node.js server with GraphQL API
- **Workflow Engine**: Event-driven execution engine
- **AI Layer**: Abstraction for multiple AI providers
- **Storage**: Pluggable storage backends (PostgreSQL, MongoDB)

## 📚 Documentation

For detailed documentation, visit [docs.mintflow.ai](https://docs.mintflow.ai):

- [Core Concepts](https://docs.mintflow.ai/concepts)
- [Node Reference](https://docs.mintflow.ai/nodes)
- [API Documentation](https://docs.mintflow.ai/api)
- [Deployment Guide](https://docs.mintflow.ai/deployment)
- [Security Best Practices](https://docs.mintflow.ai/security)

# 🐳 Docker Compose for KeyDB, Weaviate, PostgreSQL, and MongoDB

This setup provides **KeyDB, Weaviate, PostgreSQL, and MongoDB** using Docker Compose.

## 🚀 Quick Start

1. **Ensure you have Docker & Docker Compose installed**  
   - [Install Docker](https://docs.docker.com/get-docker/)
   - [Install Docker Compose](https://docs.docker.com/compose/install/)

2. **Clone or Copy this repository**

   ```sh
   git clone https://github.com/your-repo/docker-services.git
   cd docker-services
   ```

3. **Start the Services**

   ```sh
   docker-compose up -d
   ```

4. **Verify Running Containers**

   ```sh
   docker ps
   ```

5. **Stop All Services**

   ```sh
   docker-compose down
   ```

---

## 📦 Services Included

| Service    | Description                       | Port  |
|------------|-----------------------------------|-------|
| **KeyDB**  | High-performance Redis alternative | `6379` |
| **PostgreSQL** | Relational database | `5432` |
| **Weaviate** | Vector search database | `8080` |
| **MongoDB** | NoSQL database | `27017` |

---

## 🛠 Environment Variables

You can modify environment variables inside `docker-compose.yml` as needed.

| Variable | Description | Default |
|----------|------------|---------|
| `POSTGRES_USER` | PostgreSQL Username | `admin` |
| `POSTGRES_PASSWORD` | PostgreSQL Password | `admin` |
| `POSTGRES_DB` | Default Database | `mydatabase` |
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB Username | `admin` |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB Password | `admin` |

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MintFlow is released under the [MIT License](LICENSE).

## 🌟 Support

- Join our [Discord Community](https://discord.gg/mintflow)
- Follow us on [Twitter](https://twitter.com/mintflow)
- Read our [Blog](https://blog.mintflow.ai)
- Email support: <support@mintflow.ai>

## 🔐 Security

Please report security vulnerabilities to <security@mintflow.ai>.

## 🙏 Acknowledgments

MintFlow is inspired by and builds upon the work of many great projects:

- n8n
- Activepieces
- LangChain
- OpenWebUI

pnpm nx generate @nx/js:library --name=my-new-plugin --directory=packages/plugins/my-new-plugin --importPath=@mintflow/plugins/my-new-plugin --projectNameAndRootFormat=as-provided --no-interactive

Thank you to all our contributors and the open-source community!

so we hvae mintflow plugins inside plugins folder the task

1. for each __ref_only -- plugin create a mintflow plutins, we might need to change the name a little i.e when they say switch we might say decition, you can prompt me during the new plugin creation for name .

to assist you in creating plugins as the root of the mono repo you can run

pnpm generate:template {{name of plugins}}. -- this will create the blank plugins template in ./plugins/{plugingname}}

this is pnpm base project

2. afer this weill you looks at the implmentation of _ref_only then implment similar in the new plugin following our plugins achitecteture.

3. YOu can look into existing plugsin to learn about our plugins achitechtion

4. you need to know that the structure of ___ref_only plugins is not the same with mintflow plugins, inface nothnig can be directly copied without outright rewrting from scrapte. everthing you do must be rewritting or reimagines so that fit well into mintflow plugin ecoho system

5. Please add a readme to the github plugins, features, useage and any other importatn stuffs

6. please ignore plugins already implemented

7. update the plugin_mapping.md documentation with the new plugihn

8. sure we go ahead but I really dont like having too many plugins doing little things each, I'll apprecaite every oppopuniy to merge small plugs into one let me know when you find a condidate

9 kindly look into the array plug for test configuration.

10. When adding test kindly add them incrementally so you know it works before the next test. use npx jest in the plug folder to test

11. the testing framwork is jest, look in array plugin for guidance, you're not done untill all test passing

kindly look in the plugins folder __ref_only and plugins remove the thing inside__ref_only that we've have implmented someimee you need to look into the actual implmentation to effective do this becase naems of plug alone is not enoug and sometime plug were merged

update the pending_plugins.md and Plugin_mapping.md

then remove the reference from __ref_only
