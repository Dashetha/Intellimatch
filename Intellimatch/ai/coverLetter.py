import openai
import sys
import json
import os
from typing import Dict, Any

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_cover_letter(resume_data: Dict[str, Any], job_title: str, 
                         company_name: str, job_description: str, 
                         tone: str = "professional") -> Dict[str, Any]:
    """
    Generate a tailored cover letter using GPT-3
    """
    try:
        prompt = f"""
        Write a {tone} cover letter for a {job_title} position at {company_name}.
        
        Job Description:
        {job_description}
        
        Applicant Information:
        Name: {resume_data.get('name', 'Applicant')}
        Summary: {resume_data.get('summary', '')}
        Experience: {', '.join([exp.get('role', '') for exp in resume_data.get('experience', [])])}
        Skills: {', '.join(resume_data.get('skills', []))}
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional career advisor. Write a tailored cover letter that highlights the applicant's relevant skills and experience for the given position."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        cover_letter = response.choices[0].message.content.strip()
        return {"cover_letter": format_cover_letter(cover_letter)}
    
    except Exception as e:
        return {"error": str(e)}

def format_cover_letter(text: str) -> str:
    """Format the cover letter with proper structure"""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    
    if not paragraphs[0].startswith("Dear"):
        paragraphs.insert(0, "Dear Hiring Manager,")
    
    if not paragraphs[-1].startswith("Sincerely"):
        paragraphs.append("Sincerely,\n[Your Name]")
    
    return "\n\n".join(paragraphs)

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Insufficient arguments"}))
        sys.exit(1)
    
    try:
        resume_data = json.loads(sys.argv[1])
        job_title = sys.argv[2]
        company_name = sys.argv[3]
        job_description = sys.argv[4]
        tone = sys.argv[5] if len(sys.argv) > 5 else "professional"
        
        result = generate_cover_letter(
            resume_data, job_title, company_name, job_description, tone
        )
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))