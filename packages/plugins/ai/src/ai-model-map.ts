const aiModels = [
  {
    provider: 'OpenAI',
    label: 'GPT-4o',
    value: 'gpt-4o',
    description:
      "OpenAI's flagship multimodal model capable of processing text, images, and audio in real-time.",
    best_use_case:
      'Advanced conversational AI, multimodal tasks, and real-time interactions.',
  },
  {
    provider: 'OpenAI',
    label: 'GPT-4.1',
    value: 'gpt-4.1',
    description:
      'Enhanced version of GPT-4 with improved reasoning and larger context window support.',
    best_use_case:
      'Complex problem-solving, coding assistance, and long-form content generation.',
  },
  {
    provider: 'OpenAI',
    label: 'GPT-3.5 Turbo',
    value: 'gpt-3.5-turbo',
    description: 'Cost-effective model optimized for speed and performance.',
    best_use_case:
      'General-purpose tasks, chatbots, and applications requiring quick responses.',
  },
  {
    provider: 'Anthropic',
    label: 'Claude 3 Opus',
    value: 'claude-3-opus-latest',
    description:
      "Anthropic's most advanced model with near-human level intelligence.",
    best_use_case:
      'Complex reasoning, creative writing, and nuanced conversations.',
  },
  {
    provider: 'Anthropic',
    label: 'Claude 3.7 Sonnet',
    value: 'claude-3-7-sonnet-latest',
    description:
      'Balanced model offering a trade-off between performance and speed.',
    best_use_case: 'General-purpose applications and interactive AI systems.',
  },
  {
    provider: 'Anthropic',
    label: 'Claude 3 Haiku',
    value: 'claude-3-haiku-20240307',
    description: 'Lightweight model optimized for speed and efficiency.',
    best_use_case:
      'Real-time applications and tasks requiring quick responses.',
  },
  {
    provider: 'Google DeepMind',
    label: 'Gemini 2.5 Pro',
    value: 'gemini-2.5-pro',
    description:
      "Google's latest multimodal model with enhanced reasoning capabilities.",
    best_use_case:
      'Advanced AI tasks, including multimodal content generation and analysis.',
  },
  {
    provider: 'Google DeepMind',
    label: 'Gemini 2.5 Flash',
    value: 'gemini-2.5-flash',
    description:
      'Optimized for speed and efficiency in processing multimodal data.',
    best_use_case:
      'Applications requiring rapid processing of text, images, and audio.',
  },
  {
    label: 'Mistral Large',
    provider: 'Mistral',
    value: 'mistral-large',
    description: 'High-performance model designed for complex tasks.',
    best_use_case:
      'Sophisticated reasoning, data analysis, and enterprise applications.',
  },
  {
    provider: 'Mistral',
    label: 'Pixtral Large',
    value: 'pixtral-large',
    description:
      'Multimodal model capable of understanding and generating text and images.',
    best_use_case: 'Creative content generation and multimedia applications.',
  },
  {
    provider: 'Mistral',
    label: 'Mistral Small 3.1',
    value: 'mistral-small-3.1',
    description:
      'Compact model offering a balance between performance and resource usage.',
    best_use_case:
      'Edge computing and applications with limited computational resources.',
  },
  {
    provider: 'Meta',
    label: 'LLaMA 3.1 (70B)',
    value: 'llama-3.1-70b',
    description:
      "Meta's large-scale open-source model with 70 billion parameters.",
    best_use_case:
      'Research, large-scale data processing, and open-source AI development.',
  },
  {
    provider: 'Meta',
    label: 'LLaMA 3.1 (8B)',
    value: 'llama-3.1-8b',
    description: 'Smaller version of LLaMA 3.1 optimized for efficiency.',
    best_use_case:
      'Lightweight applications and scenarios requiring less computational power.',
  },
  {
    provider: 'Cohere',
    label: 'Command R+',
    value: 'command-r-plus',
    description:
      'Advanced model with retrieval-augmented generation capabilities.',
    best_use_case:
      'Enterprise applications, document summarization, and knowledge retrieval.',
  },
  {
    provider: 'Cohere',
    label: 'Command R',
    value: 'command-r',
    description: 'Efficient model designed for general-purpose tasks.',
    best_use_case:
      'Chatbots, content generation, and customer support systems.',
  },
  {
    provider: 'AWS Bedrock',
    label: 'Titan Text',
    value: 'titan-text',
    description: "Amazon's proprietary model for text generation tasks.",
    best_use_case:
      'Content creation, summarization, and text-based applications.',
  },
  {
    provider: 'Ollama',
    label: 'LLaMA 3.3',
    value: 'llama-3.3',
    description: "Locally runnable version of Meta's LLaMA 3.3 model.",
    best_use_case:
      'Offline applications and scenarios requiring on-device processing.',
  },
  {
    provider: 'Ollama',
    label: 'DeepSeek-R1',
    value: 'deepseek-r1',
    description:
      'Model optimized for local deployment with efficient performance.',
    best_use_case: 'Edge computing and privacy-focused applications.',
  },
];
export default aiModels;
