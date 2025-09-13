import { useState } from 'react';
import { Rnd } from 'react-rnd';

const BoardComponent = () => {
  const [components, setComponents] = useState([
    {
      id: 1,
      size: {width: 300, height: 200},
      position: {x: 50, y: 50},
      zIndex: 1
    },
    {
      id: 2, 
      size: {width: 200, height: 300},
      position: {x: 200, y: 100},
      zIndex: 2
    }
  ]);

  const [nextId, setNextId] = useState(3);

  const updateComponent = (id, updates) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  };

  // コンポーネントを追加する関数
  const addComponent = () => {
    const newComponent = {
      id: nextId,
      size: { width: 250, height: 180 },
      position: { 
        x: Math.random() * 300,  // ランダムな位置に配置
        y: Math.random() * 200 
      },
      zIndex: nextId
    };
    
    setComponents(prev => [...prev, newComponent]);
    setNextId(prev => prev + 1);
  };

  return (
    <>
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000
      }}>
        <button 
          onClick={addComponent}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          コンポーネントを追加
        </button>
        <div style={{ marginTop: '5px', fontSize: '12px' }}>
          現在の数: {components.length}
        </div>
      </div>

      {/* mapでレンダリング */}
      {components.map((component) => (
        <Rnd
          key={component.id}
          size={{ width: component.size.width, height: component.size.height}}
          position={{ x: component.position.x, y: component.position.y}}
          style={{ zIndex: component.zIndex}}
          onDragStop={(_e, d) => {
            updateComponent(component.id, {
              position: { x: d.x, y: d.y }
            });
          }}
          onResize={(_e, _direction, ref, _delta, position) => {
            updateComponent(component.id, {
              size: {
                width: ref.offsetWidth,
                height: ref.offsetHeight
              },
              position: position
            });
          }}
        >
          <div style={{ 
            width: '100%', 
            height: '100%', 
            background: '#f0f0f0', 
            border: `2px solid ${component.id % 2 === 1 ? 'red' : 'blue'}`,  // 奇数・偶数で色分け
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div>
              <div>ID: {component.id}</div>
              <div>zIndex: {component.zIndex}</div>
            </div>
          </div>
        </Rnd>
      ))}
    </>
  );
};

export default BoardComponent;