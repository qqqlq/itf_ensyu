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
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPosterInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://raspberrypi-1.tail8fca5.ts.net/posters_info2'
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PostersInfoResponse = await response.json();
        console.log('API Response:', data);

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
                x: (index % 3) * 420 + 50,
                y: Math.floor(index / 3) * 550 + 100,
              },
              zIndex: index + 1,
              aspectRatio,
            };
          }
        );

        setComponents(posterComponents);
        setNextId(posterComponents.length + 1);
        
        // 全てのタグを収集（重複なし）
        const tagsSet = new Set<string>();
        posterComponents.forEach(component => {
          component.tags.forEach(tag => tagsSet.add(tag));
        });
        setAllTags(Array.from(tagsSet).sort());
      } catch (err: unknown) {
        console.error('Error fetching poster info:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosterInfo();
  }, []);

  const updateComponent = (id: number, updates: Partial<PosterComponent>) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp))
    );
  };

  const addComponent = () => {
    const newComponent: PosterComponent = {
      id: nextId,
      name: `Test${nextId}`,
      postTime: new Date().toLocaleString('ja-JP'),
      tags: ['test'],
      size: { width: 250, height: 200 },
      position: {
        x: Math.random() * 300,
        y: Math.random() * 200,
      },
      zIndex: nextId,
      aspectRatio: 1.0,
    };
    setComponents((prev) => [...prev, newComponent]);
    setNextId((prev) => prev + 1);
  };

  const removeTag = (tag: string) => {
    setAllTags(prev => prev.filter(t => t !== tag));
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      newSet.delete(tag);
      return newSet;
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const getPosterImageUrl = (name: string) =>
    `https://raspberrypi-1.tail8fca5.ts.net/poster/${name}`;

  if (loading) {
    return (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '18px' }}>
        Loading posters...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '18px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {/* タグフィルター */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '80%',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '10px' }}>
          Tags:
        </span>
        {allTags.map((tag) => (
          <Tag.Root
            key={tag}
            size="md"
            colorPalette={selectedTags.has(tag) ? 'blue' : 'gray'}
            style={{ cursor: 'pointer' }}
          >
            <Tag.Label onClick={() => toggleTag(tag)}>{tag}</Tag.Label>
            <Tag.CloseTrigger onClick={() => removeTag(tag)} />
          </Tag.Root>
        ))}
      </div>

      <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 1000, backgroundColor: 'white', padding: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <button
          onClick={addComponent}
          style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          テストコンポーネントを追加
        </button>
        <div style={{ marginTop: '5px', fontSize: '12px' }}>現在の数: {components.length}</div>
      </div>

      {components
        .filter(component => {
          if (selectedTags.size === 0) return true;
          return component.tags.some(tag => selectedTags.has(tag));
        })
        .map((component) => (
        <Rnd
          key={component.id}
          size={{ width: component.size.width, height: component.size.height }}
          position={{ x: component.position.x, y: component.position.y }}
          style={{ zIndex: component.zIndex }}
          onDragStop={(_e, d) => updateComponent(component.id, { position: { x: d.x, y: d.y } })}
          onResize={(_e, _direction, ref, _delta, position) => {
            const newWidth = ref.offsetWidth;
            const newHeight = newWidth / component.aspectRatio;
            updateComponent(component.id, {
              size: { width: newWidth, height: newHeight },
              position,
            });
          }}
          lockAspectRatio={true}
        >
          <div style={{ width: '100%', height: '100%', background: 'white', border: '2px solid #ddd', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, backgroundImage: `url(${getPosterImageUrl(component.name)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#666', fontSize: '14px', textAlign: 'center' }}>
                {component.name}
              </div>
            </div>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.95)', borderTop: '1px solid #eee' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{component.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{component.postTime}</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {component.tags.map((tag, index) => (
                  <Tag.Root key={index}>
                    <Tag.Label>{tag}</Tag.Label>
                  </Tag.Root>
                ))}
              </div>
            </div>
          </div>
        </Rnd>
      ))}
    </>
  );
};

export default PosterBoardComponent;
