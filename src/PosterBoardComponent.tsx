import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';

const PosterBoardComponent = () => {
  const [components, setComponents] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // APIからポスター情報を取得
  useEffect(() => {
    const fetchPosterInfo = async () => {
      try {
        setLoading(true);
        // プロキシ経由でアクセス
        const response = await fetch('https://raspberrypi-1.tail8fca5.ts.net/posters_info');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // デバッグ用
        
        // APIデータをコンポーネント形式に変換
        const posterComponents = Object.entries(data).map(([name, info], index) => {
	  const baseWidth = 300;
	  const aspectRatio = info.aspect_ratio || 1.0;
	  const height = baseWidth / aspectRatio;
	
	  console.log(`${name}: aspect_ratio=${aspectRatio}, display=${baseWidth}x${height.toFixed(0)}`);

	  return {
		  id: index + 1,
		  name: name,
		  postTime: info.post_time,
		  tags: info.tags,
		  size: {width: baseWidth, height: height },
		  position: {
			  x: (index % 3) * 420 + 50,
      			  y: Math.floor(index / 3) * 550 + 100
			},
		  zIndex: index + 1,
		  aspectRatio: aspectRatio
		};
        });
        
        setComponents(posterComponents);
        setNextId(posterComponents.length + 1);
      } catch (err) {
        console.error('Error fetching poster info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosterInfo();
  }, []);

  const updateComponent = (id, updates) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  };

  // 新しいコンポーネントを追加（テスト用）
  const addComponent = () => {
    const newComponent = {
      id: nextId,
      name: `Test${nextId}`,
      postTime: new Date().toLocaleString('ja-JP'),
      tags: ['test'],
      size: { width: 250, height: 200 },
      position: { 
        x: Math.random() * 300, 
        y: Math.random() * 200 
      },
      zIndex: nextId
    };
    setComponents(prev => [...prev, newComponent]);
    setNextId(prev => prev + 1);
  };

  // ポスター画像を取得する関数
  const getPosterImageUrl = (name) => {
    return `https://raspberrypi-1.tail8fca5.ts.net/poster/${name}`;
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '18px'
      }}>
        Loading posters...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '18px',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={addComponent}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          テストコンポーネントを追加
        </button>
        <div style={{ marginTop: '5px', fontSize: '12px' }}>
          現在の数: {components.length}
        </div>
      </div>

      {/* ポスターコンポーネントをレンダリング */}
      {components.map((component) => (
        <Rnd
          key={component.id}
          size={{
            width: component.size.width,
            height: component.size.height
          }}
          position={{
            x: component.position.x,
            y: component.position.y
          }}
          style={{ zIndex: component.zIndex }}
          onDragStop={(_e, d) => {
            updateComponent(component.id, {
              position: { x: d.x, y: d.y }
            });
          }}
          onResize={(_e, direction, ref, delta, position) => {
            // アスペクト比を保持してリサイズ
            const newWidth = ref.offsetWidth;
            const newHeight = newWidth / component.aspectRatio;
            
            updateComponent(component.id, {
              size: {
                width: newWidth,
                height: newHeight
              },
              position: position
            });
          }}
          lockAspectRatio={true}  // アスペクト比を固定
        >
          <div style={{
            width: '100%',
            height: '100%',
            background: 'white',
            border: '2px solid #ddd',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* ポスター画像 */}
            <div style={{
              flex: 1,
              backgroundImage: `url(${getPosterImageUrl(component.name)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative'
            }}>
              {/* 画像が読み込めない場合のフォールバック */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#666',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {component.name}
              </div>
            </div>
            
            {/* 情報エリア */}
            <div style={{
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderTop: '1px solid #eee'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                {component.name}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                {component.postTime}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                {component.tags.join(', ')}
              </div>
            </div>
          </div>
        </Rnd>
      ))}
    </>
  );
};

export default PosterBoardComponent;
