require('dotenv/config');
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require('openai');
const fs = require('fs');
const readline = require('readline');

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Event handler when the bot is ready
client.on('ready', () => {
    console.log('The bot is online.');
});

// Prefix to ignore bot commands
const IGNORE_PREFIX = "!";

// Channels where the bot should respond
const CHANNELS = ['1261419478344798361', '1261731741568073836', '1261740398456344577','1262573026109558915'];

// Initialize OpenAI instance with API key
const openai = new OpenAI({
    apiKey: process.env.API_KEY, // Replace with your actual OpenAI API key from environment variables
});

// Function to load dataset from JSONL file
const loadDataset = async () => {
    const fileStream = fs.createReadStream('./cole_mount_dataset.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    let dataset = [];

    for await (const line of rl) {
        if (line.trim()) {
            try {
                const jsonLine = JSON.parse(line);
                dataset.push(jsonLine);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    }

    return dataset;
};

// Function to find the best match from the dataset
const findMatch = (prompt, dataset) => {
    try {
        return dataset.find(item => prompt.toLowerCase().includes(item.prompt.toLowerCase()));
    } catch {
        return "I'm sorry, something went wrong. Please try another prompt about Cole Mount.";
    }
};

// Event handler for incoming messages
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from bots
    if (message.content.startsWith(IGNORE_PREFIX)) return; // Ignore messages with bot commands
    if (!CHANNELS.includes(message.channelId) && !message.mentions.users.has(client.user.id)) return; // Respond only in specified channels or when mentioned

    await message.channel.sendTyping(); // Indicate typing while processing

    try {
        // Load dataset
        const dataset = await loadDataset();

        // Find the best match from the dataset
        const match = findMatch(message.content, dataset);

        // Prepare the messages array for OpenAI API call
        let messages = [
            {
                role: 'system',
                content: 'You are Hire Me Bot, Cole Mount\'s assistant. Potential employers come to you to ask questions about Cole Mount. You want Cole Mount to get the job, and you want him to make a lot of money.',
            },
            {
                role: 'user',
                content: message.content,
            },
        ];

        if (match) {
            // If a match is found, add the matched prompt and completion to the messages array
            messages.push({
                role: 'user',
                content: `Prompt: ${match.prompt}`,
            });
            messages.push({
                role: 'assistant',
                content: match.completion,
            });
        } else {
            // If no match is found, add the entire dataset as context
            messages.push({
                role: 'user',
                content: `Dataset: ${JSON.stringify(dataset)}`,
            });
        }

        // Call OpenAI API to generate completions
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
        });

        // Send the response back to the Discord channel
        const answer = response.choices[0].message.content;
        message.reply(answer);
    } catch (error) {
        console.error('Error processing message:', error);
        message.reply('An error occurred while processing your request.');
    }
});

// Function to initialize dataset loading and start the bot
const startBot = async () => {
    try {
        await client.login(process.env.TOKEN2); // Login to Discord with bot token
        console.log('Bot started successfully.');
    } catch (error) {
        console.error('Error starting bot:', error);
    }
};

// Start the bot
startBot();
