
__version__ = "2.0.0"
__author__ = "AI Detection Pro Team"

# Make key components available at package level
from .model_handler import ModelHandler
from .text_processor import TextProcessor # type: ignore

__all__ = ['ModelHandler', 'TextProcessor']