import spacy
import json
import sys
from typing import Dict, Any, List

# Load English language model
nlp = spacy.load("en_core_web_sm")

def analyze_resume_structure(resume_text: str) -> Dict[str, Any]:
    """
    Analyze resume structure for ATS compatibility
    """
    try:
        doc = nlp(resume_text)
        
        # Check for common sections
        sections = {
            "has_summary": False,
            "has_experience": False,
            "has_education": False,
            "has_skills": False,
            "section_headings": []
        }
        
        common_headings = [
            "summary", "experience", "education", "skills",
            "work history", "professional experience", "technical skills"
        ]
        
        for sent in doc.sents:
            text = sent.text.lower()
            if any(heading in text for heading in common_headings):
                sections["section_headings"].append(sent.text.strip())
                
                if "summary" in text:
                    sections["has_summary"] = True
                elif "experience" in text or "work history" in text:
                    sections["has_experience"] = True
                elif "education" in text:
                    sections["has_education"] = True
                elif "skills" in text:
                    sections["has_skills"] = True
        
        return {
            "structure_analysis": sections,
            "recommendations": generate_recommendations(sections)
        }
    
    except Exception as e:
        return {"error": str(e)}

def generate_recommendations(sections: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on structure analysis"""
    recommendations = []
    
    if not sections["has_summary"]:
        recommendations.append("Add a professional summary section")
    if not sections["has_experience"]:
        recommendations.append("Ensure work experience is clearly labeled")
    if not sections["has_education"]:
        recommendations.append("Include an education section")
    if not sections["has_skills"]:
        recommendations.append("Add a skills section")
    
    if len(sections["section_headings"]) < 3:
        recommendations.append("Consider adding more sections to organize your resume")
    
    return recommendations

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No resume text provided"}))
        sys.exit(1)
    
    resume_text = sys.argv[1]
    result = analyze_resume_structure(resume_text)
    print(json.dumps(result))