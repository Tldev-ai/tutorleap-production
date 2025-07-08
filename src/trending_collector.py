import requests
import feedparser
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta

class TrendingCollector:
    """Collect trending topics from various sources"""
    
    def __init__(self):
        """Initialize the trending collector"""
        self.sources = {
            'technology': [
                'https://feeds.feedburner.com/TechCrunch',
                'https://www.wired.com/feed/rss',
                'https://feeds.feedburner.com/oreilly/radar',
            ],
            'business': [
                'https://feeds.feedburner.com/entrepreneur',
                'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
            ],
            'health': [
                'https://feeds.feedburner.com/healthline',
                'https://www.medicalnewstoday.com/rss',
            ],
            'lifestyle': [
                'https://feeds.feedburner.com/MinimalismBlog',
            ]
        }
    
    def get_trending_topics(self, niche="Technology", max_topics=10):
        """
        Get trending topics for a specific niche
        
        Args:
            niche (str): The niche to get trends for
            max_topics (int): Maximum number of topics to return
        
        Returns:
            list: List of trending topics
        """
        try:
            niche_key = niche.lower()
            
            if niche_key not in self.sources:
                # Return some generic topics if niche not found
                return self._get_fallback_topics(niche, max_topics)
            
            all_topics = []
            
            # Collect from RSS feeds
            for feed_url in self.sources[niche_key]:
                try:
                    topics = self._parse_rss_feed(feed_url)
                    all_topics.extend(topics)
                except Exception as e:
                    print(f"Error parsing feed {feed_url}: {str(e)}")
                    continue
            
            # Sort by relevance and recency
            sorted_topics = self._sort_topics_by_relevance(all_topics)
            
            return sorted_topics[:max_topics]
            
        except Exception as e:
            print(f"Error collecting trending topics: {str(e)}")
            return self._get_fallback_topics(niche, max_topics)
    
    def _parse_rss_feed(self, feed_url):
        """Parse an RSS feed and extract topics"""
        try:
            feed = feedparser.parse(feed_url)
            topics = []
            
            for entry in feed.entries[:20]:  # Limit to recent entries
                # Extract publish date
                pub_date = None
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    pub_date = datetime(*entry.published_parsed[:6])
                
                # Only include recent articles (last 7 days)
                if pub_date and pub_date < datetime.now() - timedelta(days=7):
                    continue
                
                topic = {
                    'title': entry.title,
                    'summary': getattr(entry, 'summary', ''),
                    'link': getattr(entry, 'link', ''),
                    'published': pub_date.isoformat() if pub_date else None,
                    'source': feed.feed.get('title', 'Unknown'),
                    'keywords': self._extract_keywords(entry.title + ' ' + getattr(entry, 'summary', ''))
                }
                
                topics.append(topic)
            
            return topics
            
        except Exception as e:
            print(f"Error parsing RSS feed {feed_url}: {str(e)}")
            return []
    
    def _extract_keywords(self, text):
        """Extract keywords from text"""
        # Simple keyword extraction - in production, you'd use more sophisticated NLP
        text = text.lower()
        
        # Common tech keywords
        keywords = []
        tech_terms = [
            'ai', 'artificial intelligence', 'machine learning', 'blockchain', 'cryptocurrency',
            'cloud computing', 'cybersecurity', 'data science', 'automation', 'robotics',
            'virtual reality', 'augmented reality', 'iot', 'internet of things', '5g',
            'quantum computing', 'fintech', 'startup', 'innovation', 'digital transformation'
        ]
        
        for term in tech_terms:
            if term in text:
                keywords.append(term)
        
        return keywords
    
    def _sort_topics_by_relevance(self, topics):
        """Sort topics by relevance and recency"""
        def score_topic(topic):
            score = 0
            
            # Recency score (newer = better)
            if topic.get('published'):
                try:
                    pub_date = datetime.fromisoformat(topic['published'])
                    days_old = (datetime.now() - pub_date).days
                    score += max(0, 10 - days_old)  # More recent = higher score
                except:
                    pass
            
            # Keyword relevance score
            score += len(topic.get('keywords', []))
            
            # Title engagement potential
            title = topic.get('title', '').lower()
            engagement_words = ['new', 'revolutionary', 'breakthrough', 'innovative', 'future', 'trends']
            for word in engagement_words:
                if word in title:
                    score += 2
            
            return score
        
        return sorted(topics, key=score_topic, reverse=True)
    
    def _get_fallback_topics(self, niche, max_topics):
        """Get fallback topics when feeds fail"""
        fallback_topics = {
            'technology': [
                'Latest AI breakthroughs transforming industries',
                'Cybersecurity trends every business should know',
                'The future of cloud computing in 2024',
                'How automation is changing the workplace',
                'Blockchain applications beyond cryptocurrency',
                'The rise of quantum computing',
                'IoT devices revolutionizing smart homes',
                'Machine learning in healthcare innovation',
                '5G technology changing mobile experiences',
                'Virtual reality in education and training'
            ],
            'business': [
                'Remote work strategies for productivity',
                'Digital marketing trends for small businesses',
                'Sustainable business practices gaining momentum',
                'Entrepreneurship in the digital age',
                'Customer experience optimization techniques',
                'Supply chain innovation and efficiency',
                'Financial planning for business growth',
                'Leadership skills for modern managers',
                'E-commerce strategies that work',
                'Building company culture remotely'
            ],
            'health': [
                'Mental health awareness and strategies',
                'Nutrition trends for optimal wellness',
                'Exercise routines for busy professionals',
                'Sleep optimization for better health',
                'Stress management in modern life',
                'Preventive healthcare approaches',
                'Healthy aging strategies',
                'Immune system boosting tips',
                'Digital health monitoring tools',
                'Mindfulness and meditation benefits'
            ],
            'lifestyle': [
                'Minimalism for modern living',
                'Sustainable lifestyle choices',
                'Work-life balance strategies',
                'Personal development and growth',
                'Time management techniques',
                'Travel tips for budget-conscious adventurers',
                'Home organization and decluttering',
                'Financial wellness and budgeting',
                'Creative hobbies for stress relief',
                'Building meaningful relationships'
            ]
        }
        
        niche_topics = fallback_topics.get(niche.lower(), fallback_topics['technology'])
        return niche_topics[:max_topics]
    
    def get_topic_suggestions(self, current_topic, niche="Technology"):
        """Get related topic suggestions based on current topic"""
        try:
            # In a real implementation, this would use NLP to find related topics
            # For now, we'll return trending topics from the same niche
            trending = self.get_trending_topics(niche, 5)
            return [topic.get('title', topic) for topic in trending if isinstance(topic, dict)][:3]
        except:
            return self._get_fallback_topics(niche, 3)