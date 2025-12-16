import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Tag } from "@chakra-ui/react";

type PosterInfo = {
  post_time: string;
  tags: string[];
  width: number;
  height: number;
  aspect_ratio: number;
};

type PostersInfoResponse = Record<string, PosterInfo>;

type PosterComponent = {
  id: number;
  name: string;
  postTime: string;
  tags: string[];
  size: { width: number; height: number };
  position: { x: number; y: number };
  zIndex: number;
  aspectRatio: number;
};

const PosterBoardComponent = () => {
  const [components, setComponents] = useState<PosterComponent[]>([]);
  // const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());


  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const fetchPosterInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://raspberrypi-1.tail8fca5.ts.net/posters_info'
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PostersInfoResponse = await response.json();

        const boardWidth = window.innerWidth;
        const boardHeight = window.innerHeight;

        const posterComponents: PosterComponent[] = Object.entries(data).map(
          ([name, info], index) => {
            const baseWidth = 300;
            const aspectRatio = info.aspect_ratio;
            const height = baseWidth / aspectRatio;

            return {
              id: index + 1,
              name,
              postTime: info.post_time,
              tags: info.tags,
              size: { width: baseWidth, height },
              position: {
                x: Math.random() * (boardWidth - baseWidth),
                y: Math.random() * (boardHeight - height),
              },
              zIndex: index + 1,
              aspectRatio,
            };
          }
        );

        setComponents(posterComponents);
        // setNextId(posterComponents.length + 1);

        const tagsSet = new Set<string>();
        posterComponents.forEach(c =>
          c.tags.forEach(t => tagsSet.add(t))
        );
        setAllTags(Array.from(tagsSet).sort());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosterInfo();
  }, []);

  const updateComponent = (id: number, updates: Partial<PosterComponent>) => {
    setComponents(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const s = new Set(prev);
      s.has(tag) ? s.delete(tag) : s.add(tag);
      return s;
    });
  };

  const getPosterImageUrl = (name: string) =>
    `https://raspberrypi-1.tail8fca5.ts.net/poster/${name}`;

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'white',
          padding: '10px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {allTags.map(tag => (
          <Tag.Root
            key={tag}
            colorPalette={selectedTags.has(tag) ? 'blue' : 'gray'}
            style={{ cursor: 'pointer' }}
            onClick={() => toggleTag(tag)}
          >
            <Tag.Label>{tag}</Tag.Label>
          </Tag.Root>
        ))}
      </div>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          background: '#f5f5f5',
        }}
      >
        {components
          .filter(c =>
            selectedTags.size === 0 ||
            c.tags.some(t => selectedTags.has(t))
          )
          .map(component => (
            <Rnd
              key={component.id}
              bounds="parent"
              size={component.size}
              position={component.position}
              style={{ zIndex: component.zIndex }}
              lockAspectRatio
              onDragStop={(_, d) =>
                updateComponent(component.id, {
                  position: { x: d.x, y: d.y },
                })
              }
              onResize={(_, __, ref, ___, position) => {
                const width = ref.offsetWidth;
                updateComponent(component.id, {
                  size: {
                    width,
                    height: width / component.aspectRatio,
                  },
                  position,
                });
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  border: '2px solid #ddd',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundImage: `url(${getPosterImageUrl(component.name)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </Rnd>
          ))}
      </div>
    </>
  );
};

export default PosterBoardComponent;