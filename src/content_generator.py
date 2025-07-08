import os
import re
from openai import OpenAI

class ContentGenerator:
    """Generate social media content using OpenAI"""
    
    def __init__(self):
        """Initialize the content generator"""
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    def generate_post(self, topic, niche="Technology", style="professional", max_length=2200):
        """
        Generate a complete social media post with caption and hashtags
        
        Args:
            topic (str): The main topic/subject for the post
            niche (str): The niche/category (e.g., Technology, Health, etc.)
            style (str): Style of the content (professional, casual, educational, etc.)
            max_length (int): Maximum length for the caption
        
        Returns:
            dict: Generated content with caption, hashtags, and metadata
        """
        try:
            # Generate caption
            caption = self._generate_caption(topic, niche, style, max_length)
            
            # Generate hashtags
            hashtags = self._generate_hashtags(topic, niche)
            
            # Calculate engagement metrics
            hook_score = self._analyze_hook(caption)
            
            return {
                'success': True,
                'caption': caption,
                'hashtags': hashtags,
                'topic': topic,
                'niche': niche,
                'style': style,
                'character_count': len(caption),
                'hook_score': hook_score,
                'estimated_reach': self._estimate_reach(len(hashtags), hook_score)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'topic': topic,
                'niche': niche,
                'style': style
            }
    
    def _generate_caption(self, topic, niche, style, max_length):
        """Generate engaging caption using OpenAI"""
        
        style_prompts = {
            "professional": "Write in a professional, authoritative tone that builds trust and credibility.",
            "casual": "Write in a friendly, conversational tone like talking to a friend.",
            "educational": "Write in an informative, teaching style that helps people learn something new.",
            "inspirational": "Write in an uplifting, motivational tone that inspires action.",
            "entertaining": "Write in a fun, engaging tone that entertains while informing."
        }
        
        style_instruction = style_prompts.get(style.lower(), style_prompts["professional"])
        
        prompt = f"""
        Create an engaging Instagram caption about {topic} in the {niche} niche.
        
        Style: {style_instruction}
        
        Requirements:
        - Maximum {max_length} characters
        - Start with a strong hook that grabs attention
        - Include valuable insights or actionable tips
        - Add a call-to-action at the end
        - Write for social media engagement
        - Make it scannable with line breaks
        - Don't include hashtags (they'll be added separately)
        
        The caption should be informative, engaging, and encourage interaction.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert social media content creator who writes viral, engaging captions that drive high engagement."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=800,
            temperature=0.8
        )
        
        caption = response.choices[0].message.content.strip()
        
        # Clean up the caption
        caption = re.sub(r'^["\']+|["\']+$', '', caption)  # Remove quotes
        caption = caption.replace('\\n', '\n')  # Fix line breaks
        
        # Ensure it's within length limit
        if len(caption) > max_length:
            caption = caption[:max_length-3] + "..."
        
        return caption
    
    def _generate_hashtags(self, topic, niche, count=20):
        """Generate relevant hashtags"""
        
        prompt = f"""
        Generate {count} highly relevant Instagram hashtags for a post about {topic} in the {niche} niche.
        
        Requirements:
        - Mix of popular (100k+ posts) and niche-specific hashtags
        - Include trending hashtags when relevant
        - Avoid banned or shadowbanned hashtags
        - Focus on hashtags that your target audience would search for
        - Include a mix of broad and specific hashtags
        
        Return only the hashtags, one per line, without the # symbol.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in Instagram hashtag strategy and SEO."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        hashtag_text = response.choices[0].message.content.strip()
        hashtags = [
            tag.strip().replace('#', '') 
            for tag in hashtag_text.split('\n') 
            if tag.strip()
        ]
        
        # Clean and validate hashtags
        cleaned_hashtags = []
        for tag in hashtags:
            # Remove special characters and spaces
            clean_tag = re.sub(r'[^a-zA-Z0-9]', '', tag)
            if clean_tag and len(clean_tag) > 2:
                cleaned_hashtags.append(clean_tag.lower())
        
        return cleaned_hashtags[:count]
    
    def _analyze_hook(self, caption):
        """Analyze the strength of the opening hook"""
        if not caption:
            return 0
        
        first_line = caption.split('\n')[0].strip()
        
        # Hook scoring factors
        score = 0
        
        # Length check (optimal 8-15 words)
        word_count = len(first_line.split())
        if 8 <= word_count <= 15:
            score += 20
        elif 5 <= word_count <= 20:
            score += 10
        
        # Question hooks
        if first_line.endswith('?'):
            score += 15
        
        # Number hooks
        if re.search(r'\d+', first_line):
            score += 10
        
        # Power words
        power_words = ['secret', 'revealed', 'proven', 'shocking', 'amazing', 'incredible', 'ultimate', 'essential']
        if any(word in first_line.lower() for word in power_words):
            score += 15
        
        # Emotional words
        emotional_words = ['love', 'hate', 'fear', 'excited', 'surprised', 'angry', 'happy']
        if any(word in first_line.lower() for word in emotional_words):
            score += 10
        
        # Call-out words
        callout_words = ['you', 'your', 'stop', 'warning', 'attention']
        if any(word in first_line.lower() for word in callout_words):
            score += 10
        
        return min(score, 100)  # Cap at 100
    
    def _estimate_reach(self, hashtag_count, hook_score):
        """Estimate potential reach based on content quality"""
        base_reach = 100  # Minimum reach
        
        # Hashtag factor
        hashtag_factor = min(hashtag_count * 10, 200)
        
        # Hook quality factor
        hook_factor = hook_score * 2
        
        estimated_reach = base_reach + hashtag_factor + hook_factor
        
        return {
            'estimated_impressions': f"{estimated_reach}-{estimated_reach * 3}",
            'confidence': 'medium' if hook_score > 60 else 'low'
        }