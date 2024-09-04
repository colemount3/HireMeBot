<<<<<<< HEAD
### Workflow Overview

The chatbot operates as follows (in shameless pseudo-code):

1. **User Input:** A user prompts the bot.
2. **Database Matching:** The bot searches its database for a matching response.
   
   - **If a match is found:**
     - The bot sends both the prompt and the matched response to GPT-3.5 Turbo.
     - GPT-3.5 Turbo refines or generates a response, which is then returned to the user.
   
   - **If no match is found:**
     - The entire dataset is sent to GPT-3.5 Turbo.
     - GPT-3.5 Turbo uses the dataset and the prompt to generate a response, which is sent back to the user.
     - *(Note: This approach is feasible for smaller datasets like mine.)*

=======
This file is for code review and referance purposes only. For a demonstration of the bot, please reach out and I will provide a link/ add channel permissions. 

>>>>>>> 5009aa1 (format changes)
