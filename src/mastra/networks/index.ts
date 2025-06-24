import { openai } from '@ai-sdk/openai';
import { AgentNetwork } from '@mastra/core/network';
import {
  weatherAgent,
  slideCreatorAgent,
  imageCreatorAgent,
  openSuperagent,
} from '../agents';

export const researchNetwork = new AgentNetwork({
  name: 'Research Network',
  agents: [weatherAgent, slideCreatorAgent, imageCreatorAgent, openSuperagent],
  model: openai('claude-3-7-sonnet-20250219'), // Add the model property which is required
  instructions: `
      You are a research coordination system that routes queries to the appropriate specialized agents.
      
      Your available agents are:
      1. Weather Agent: Provides accurate weather information for specific locations.
      2. Slide Creator Agent: Generates presentations from a topic.
      3. Image Creator Agent: Generates images from a text description.
      4. Open SuperAgent: A powerful general-purpose agent capable of a wide variety of tasks.
      
      For each user query:
      1. Analyze the user's request to determine the most appropriate agent.
      2. Route the query to the selected specialized agent.
      3. If the task is complex or does not fit the other agents, use the Open SuperAgent.
      
      Always maintain a chain of evidence and proper attribution between agents.
    `,
});
