import re
from datetime import datetime

class TopicProcessor:
    """Process and analyze topics for content generation"""
    
    def __init__(self):
        """Initialize the topic processor"""
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might'
        }
    
    def analyze_topic(self, topic):
        """
        Analyze a topic and extract key information
        
        Args:
            topic (str): The topic to analyze
        
        Returns:
            dict: Analysis results including keywords, sentiment, complexity
        """
        try:
            # Clean the topic
            cleaned_topic = self._clean_topic(topic)
            
            # Extract keywords
            keywords = self._extract_keywords(cleaned_topic)
            
            # Determine complexity
            complexity = self._determine_complexity(cleaned_topic)
            
            # Estimate engagement potential
            engagement_score = self._estimate_engagement(cleaned_topic)
            
            # Suggest content angles
            content_angles = self._suggest_content_angles(cleaned_topic)
            
            return {
                'original_topic': topic,
                'cleaned_topic': cleaned_topic,
                'keywords': keywords,
                'complexity': complexity,
                'engagement_score': engagement_score,
                'content_angles': content_angles,
                'word_count': len(cleaned_topic.split()),
                'character_count': len(cleaned_topic),
                'analysis_timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'original_topic': topic
            }
    
    def _clean_topic(self, topic):
        """Clean and normalize topic text"""
        # Remove extra whitespace
        cleaned = re.sub(r'\s+', ' ', topic.strip())
        
        # Remove special characters except hyphens and apostrophes
        cleaned = re.sub(r'[^\w\s\-\']', '', cleaned)
        
        return cleaned
    
    def _extract_keywords(self, topic):
        """Extract important keywords from topic"""
        words = topic.lower().split()
        
        # Filter out stop words
        keywords = [word for word in words if word not in self.stop_words and len(word) > 2]
        
        # Sort by potential importance (longer words first)
        keywords.sort(key=len, reverse=True)
        
        return keywords[:10]  # Return top 10 keywords
    
    def _determine_complexity(self, topic):
        """Determine the complexity level of the topic"""
        words = topic.split()
        word_count = len(words)
        
        # Technical terms that indicate complexity
        technical_terms = [
            'algorithm', 'blockchain', 'cryptocurrency', 'artificial intelligence',
            'machine learning', 'quantum', 'cybersecurity', 'encryption',
            'neural network', 'deep learning', 'automation', 'infrastructure',
            'optimization', 'analytics', 'transformation', 'implementation'
        ]
        
        complexity_score = 0
        
        # Word count factor
        if word_count > 8:
            complexity_score += 2
        elif word_count > 5:
            complexity_score += 1
        
        # Technical terms factor
        topic_lower = topic.lower()
        for term in technical_terms:
            if term in topic_lower:
                complexity_score += 2
        
        # Average word length factor
        avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
        if avg_word_length > 7:
            complexity_score += 2
        elif avg_word_length > 5:
            complexity_score += 1
        
        # Determine complexity level
        if complexity_score >= 6:
            return {'level': 'high', 'score': complexity_score, 'description': 'Complex technical topic requiring detailed explanation'}
        elif complexity_score >= 3:
            return {'level': 'medium', 'score': complexity_score, 'description': 'Moderately complex topic accessible to general audience'}
        else:
            return {'level': 'low', 'score': complexity_score, 'description': 'Simple topic easy to understand'}
    
    def _estimate_engagement(self, topic):
        """Estimate the potential engagement level of the topic"""
        topic_lower = topic.lower()
        engagement_score = 50  # Base score
        
        # Positive engagement factors
        engagement_boosters = [
            ('future', 10), ('new', 8), ('revolutionary', 15), ('breakthrough', 12),
            ('innovative', 10), ('trending', 8), ('latest', 6), ('ultimate', 10),
            ('secret', 12), ('hidden', 8), ('surprising', 10), ('shocking', 12),
            ('amazing', 8), ('incredible', 10), ('proven', 8), ('powerful', 8),
            ('essential', 6), ('important', 6), ('critical', 8), ('vital', 8)
        ]
        
        for word, boost in engagement_boosters:
            if word in topic_lower:
                engagement_score += boost
        
        # Question format boost
        if '?' in topic:
            engagement_score += 15
        
        # Number inclusion boost
        if re.search(r'\d+', topic):
            engagement_score += 8
        
        # Controversy indicators
        controversy_words = ['vs', 'versus', 'debate', 'controversy', 'argument', 'dispute']
        for word in controversy_words:
            if word in topic_lower:
                engagement_score += 12
        
        # How-to format boost
        if topic_lower.startswith(('how to', 'how', 'why', 'what', 'when', 'where')):
            engagement_score += 10
        
        # Cap the score at 100
        engagement_score = min(engagement_score, 100)
        
        return {
            'score': engagement_score,
            'level': 'high' if engagement_score >= 80 else 'medium' if engagement_score >= 60 else 'low',
            'description': self._get_engagement_description(engagement_score)
        }
    
    def _get_engagement_description(self, score):
        """Get description for engagement score"""
        if score >= 80:
            return "High viral potential with strong engagement indicators"
        elif score >= 60:
            return "Good engagement potential with solid interest factors"
        elif score >= 40:
            return "Moderate engagement potential, may need compelling angle"
        else:
            return "Lower engagement potential, consider more compelling framing"
    
    def _suggest_content_angles(self, topic):
        """Suggest different content angles for the topic"""
        angles = []
        topic_lower = topic.lower()
        
        # Educational angle
        angles.append({
            'angle': 'Educational',
            'description': f"Explain {topic} in simple terms",
            'hook_example': f"Everything you need to know about {topic}"
        })
        
        # Personal experience angle
        angles.append({
            'angle': 'Personal Experience',
            'description': f"Share personal insights about {topic}",
            'hook_example': f"My experience with {topic} (and what I learned)"
        })
        
        # Future prediction angle
        angles.append({
            'angle': 'Future Trends',
            'description': f"Discuss the future implications of {topic}",
            'hook_example': f"How {topic} will change everything in 2024"
        })
        
        # Problem-solution angle
        angles.append({
            'angle': 'Problem-Solution',
            'description': f"Present {topic} as a solution to common problems",
            'hook_example': f"This {topic} solution will save you hours"
        })
        
        # Myth-busting angle if controversy detected
        if any(word in topic_lower for word in ['myth', 'truth', 'fact', 'reality']):
            angles.append({
                'angle': 'Myth-Busting',
                'description': f"Debunk common misconceptions about {topic}",
                'hook_example': f"The truth about {topic} (most people get this wrong)"
            })
        
        return angles[:4]  # Return top 4 angles
    
    def optimize_topic_for_engagement(self, topic):
        """Optimize a topic for better engagement"""
        analysis = self.analyze_topic(topic)
        
        suggestions = []
        
        # If engagement is low, suggest improvements
        if analysis['engagement_score']['score'] < 60:
            suggestions.append("Consider adding numbers or statistics")
            suggestions.append("Try starting with 'How to' or 'Why'")
            suggestions.append("Add words like 'secret', 'proven', or 'revolutionary'")
        
        # If complexity is high, suggest simplification
        if analysis['complexity']['level'] == 'high':
            suggestions.append("Consider simplifying technical terms")
            suggestions.append("Break down into multiple simpler topics")
            suggestions.append("Add 'explained simply' or 'for beginners'")
        
        # Suggest trending modifications
        trending_modifiers = [
            "in 2024", "latest trends", "breakthrough", "game-changing",
            "you need to know", "everyone's talking about"
        ]
        
        optimized_variations = []
        for modifier in trending_modifiers[:3]:
            optimized_variations.append(f"{topic} {modifier}")
        
        return {
            'original_analysis': analysis,
            'suggestions': suggestions,
            'optimized_variations': optimized_variations,
            'recommended_angle': analysis['content_angles'][0] if analysis['content_angles'] else None
        }