import { useState } from 'react';
import { Rnd } from 'react-rnd';

const BoardComponent = () => {
//   const [position, setPosition] = useState({ x: 100, y: 100 });
//   const [size, setSize] = useState({ width: 200, height: 200 });

  const [component1, setComponent1] = useState({
    size: {width: 300, height: 200},
    position: {x: 50, y: 50},
    zIndex: 1
  });

  const [component2, setComponent2] = useState({
    size: {width: 200, height: 300},
    position: {x: 50, y: 50},
    zIndex: 2
  });


  return (
    <>
        {/* <Rnd
        size={{ width: size.width, height: size.height }}
        position={{ x: position.x, y: position.y }}
        onDragStop={(_e, d) => {
            setPosition({ x: d.x, y: d.y });
        }}
        onResize={(_e, _direction, ref, _delta, position) => {
            setSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            });
            setPosition(position);
        }}
        >
        <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>
            ドラッグ&リサイズ可能
        </div>
        </Rnd> */}

        <Rnd
            size={{ width: component1.size.width, height: component1.size.height}}
            position={{ x: component1.position.x, y: component1.position.y}}
            style={{ zIndex: component1.zIndex}}
            onDragStop={(_e, d) => {
                setComponent1(prev => ({
                    ...prev,
                    position: {x: d.x, y: d.y}
                }));
            }}
            onResize={(_e, _direction, ref, _delta, position) => {
                setComponent1(prev => ({
                    ...prev,
                    size: {
                        width: ref.offsetWidth,
                        height: ref.offsetHeight
                    },
                    position: position
                }));
            }}
        >
            <div style={{ width: '100%', height: '100%', background: '#f0f0f0', border: "2px solid red", }}>
                zIndexは1
            </div>

        </Rnd>

        <Rnd
            size={{ width: component2.size.width, height: component2.size.height}}
            position={{ x: component2.position.x, y: component2.position.y}}
            style={{ zIndex: component2.zIndex}}
            onDragStop={(_e, d) => {
                setComponent2(prev => ({
                    ...prev,
                    position: {x: d.x, y: d.y}
                }));
            }}
            onResize={(_e, _direction, ref, _delta, position) => {
                setComponent2(prev => ({
                    ...prev,
                    size: {
                        width: ref.offsetWidth,
                        height: ref.offsetHeight
                    },
                    position: position
                }));
            }}
        >
            <div style={{ width: '100%', height: '100%', background: '#f0f0f0', border: "2px solid blue",}}>
                zIndexは2
            </div>

        </Rnd>

    </>
  );
};

export default BoardComponent;