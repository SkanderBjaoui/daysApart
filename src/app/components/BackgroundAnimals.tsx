import React, { useState, useEffect } from 'react';
import { 
  Cat, Rabbit, Bird, Fish, Heart, Star, Sparkles, 
  Dog, Turtle, Flower
} from 'lucide-react';

interface FloatingAnimal {
  id: number;
  type: string;
  icon: React.ComponentType<any>;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const ANIMAL_TYPES = [
  { type: 'cat', icon: Cat, color: 'text-[#FFB3D9]' }, // Pastel pink
  { type: 'rabbit', icon: Rabbit, color: 'text-[#B3D9FF]' }, // Pastel blue
  { type: 'bird', icon: Bird, color: 'text-[#FFF3B3]' }, // Pastel yellow
  { type: 'fish', icon: Fish, color: 'text-[#B3FFF0]' }, // Pastel cyan
  { type: 'dog', icon: Dog, color: 'text-[#FFD9B3]' }, // Pastel orange
  { type: 'turtle', icon: Turtle, color: 'text-[#B3FFB3]' }, // Pastel green
  { type: 'heart', icon: Heart, color: 'text-[#FF69B4]' }, // Hot pink
  { type: 'star', icon: Star, color: 'text-[#FFE4B5]' }, // Moccasin
  { type: 'sparkles', icon: Sparkles, color: 'text-[#E6E6FA]' }, // Lavender
  { type: 'flower', icon: Flower, color: 'text-[#FFB3BA]' } // Light pink
];

export const BackgroundAnimals: React.FC = () => {
  const [animals, setAnimals] = useState<FloatingAnimal[]>([]);

  useEffect(() => {
    // Generate initial animals
    const generateAnimals = () => {
      const newAnimals: FloatingAnimal[] = [];
      const animalCount = Math.floor(Math.random() * 6) + 8; // 8-14 animals
      
      for (let i = 0; i < animalCount; i++) {
        const animalType = ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)];
        newAnimals.push({
          id: Date.now() + i,
          type: animalType.type,
          icon: animalType.icon,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 16 + 20, // 20-36px
          duration: Math.random() * 8 + 4, // 4-12s
          delay: Math.random() * 3, // 0-3s delay
          opacity: Math.random() * 0.4 + 0.3 // 0.3-0.7 opacity
        });
      }
      return newAnimals;
    };

    setAnimals(generateAnimals());

    // Regenerate animals more frequently for continuous appearance/disappearance
    const interval = setInterval(() => {
      setAnimals(generateAnimals());
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {animals.map((animal) => {
        const Icon = animal.icon;
        const animalType = ANIMAL_TYPES.find(a => a.type === animal.type);
        
        return (
          <div
            key={animal.id}
            className={`absolute ${animalType?.color} transition-all duration-1000 ease-in-out`}
            style={{
              left: `${animal.x}%`,
              top: `${animal.y}%`,
              width: `${animal.size}px`,
              height: `${animal.size}px`,
              opacity: animal.opacity,
              animation: `float ${animal.duration}s ease-in-out ${animal.delay}s infinite`,
              transform: `translate(-50%, -50%)`
            }}
          >
            <Icon 
              className="w-full h-full" 
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </div>
        );
      })}
      
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: translate(-50%, -50%) translateY(-20px) rotate(5deg);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) translateY(0px) rotate(-5deg);
            opacity: 1;
          }
          75% {
            transform: translate(-50%, -50%) translateY(20px) rotate(3deg);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
