import openai
import sys
import json
import os
from typing import Dict, Any

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def enhance_resume_line(text: str) -> Dict[str, Any]:
    """
    Enhance a resume line using GPT-3
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional resume writer. Improve the following resume bullet point by making it more impactful with action verbs and measurable results. Keep it concise (1 sentence)."
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        enhanced_text = response.choices[0].message.content.strip()
        return {"enhanced_text": enhanced_text}
    
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No text provided"}))
        sys.exit(1)
    
    text = sys.argv[1]
    result = enhance_resume_line(text)
    print(json.dumps(result))