/**
 * Explorable Systems: Interactive Bubble Map / Cluster Visualizer
 * Ideal for ML model training runs, dataset distributions, asset hierarchies, or multi-dimensional data.
 * Zero-dependency, pure HTML5 Canvas / SVG implementation.
 */
class BubbleMapVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container #${containerId} not found`);
    this.options = Object.assign({
      width: this.container.clientWidth || 800,
      height: this.container.clientHeight || 500,
      minRadius: 20,
      maxRadius: 75,
      bg: '#f7f4ec',
      textColor: '#1e1e1e',
      onSelect: (node) => {}
    }, options);

    this.nodes = [];
    this.selectedNode = null;
    this.hoveredNode = null;
    this.initCanvas();
  }

  initCanvas() {
    this.container.innerHTML = '';
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width * window.devicePixelRatio;
    this.canvas.height = this.options.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.options.width}px`;
    this.canvas.style.height = `${this.options.height}px`;
    this.canvas.style.cursor = 'grab';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.container.appendChild(this.canvas);

    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  setData(dataItems) {
    // dataItems = [{ id, label, value, group, color, details }]
    const values = dataItems.map(d => d.value);
    const minVal = Math.min(...values) || 1;
    const maxVal = Math.max(...values) || 100;

    const cx = this.options.width / 2;
    const cy = this.options.height / 2;

    this.nodes = dataItems.map((item, i) => {
      const norm = (item.value - minVal) / (maxVal - minVal || 1);
      const r = this.options.minRadius + norm * (this.options.maxRadius - this.options.minRadius);
      const angle = (i / dataItems.length) * Math.PI * 2;
      const dist = 120 + Math.random() * 80;
      return {
        ...item,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: r
      };
    });

    this.runSimulation(80);
    this.render();
  }

  runSimulation(iterations = 50) {
    const cx = this.options.width / 2;
    const cy = this.options.height / 2;

    for (let k = 0; k < iterations; k++) {
      for (let i = 0; i < this.nodes.length; i++) {
        const a = this.nodes[i];
        // Pull to center
        a.x += (cx - a.x) * 0.02;
        a.y += (cy - a.y) * 0.02;

        // Collision repulsion
        for (let j = i + 1; j < this.nodes.length; j++) {
          const b = this.nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = a.radius + b.radius + 12;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
          }
        }
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = this.options.bg;
    ctx.fillRect(0, 0, this.options.width, this.options.height);

    for (const node of this.nodes) {
      const isHover = this.hoveredNode && this.hoveredNode.id === node.id;
      const isSel = this.selectedNode && this.selectedNode.id === node.id;

      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color || '#ffd43b';
      ctx.fill();

      ctx.lineWidth = isSel ? 3 : (isHover ? 2.5 : 1.5);
      ctx.strokeStyle = isSel ? '#000000' : (isHover ? '#333333' : '#1e1e1e');
      ctx.stroke();

      // Shadow for depth
      if (isHover || isSel) {
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 12;
      }

      // Label
      ctx.fillStyle = '#1e1e1e';
      ctx.font = `600 ${Math.max(10, Math.min(14, node.radius * 0.32))}px "Space Grotesk", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const words = node.label.split(' ');
      if (words.length === 1 || node.radius < 32) {
        ctx.fillText(node.label, node.x, node.y);
      } else {
        ctx.fillText(words.slice(0, Math.ceil(words.length/2)).join(' '), node.x, node.y - 7);
        ctx.fillText(words.slice(Math.ceil(words.length/2)).join(' '), node.x, node.y + 7);
      }
      ctx.restore();
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let hit = null;
    for (const n of this.nodes) {
      const dx = mx - n.x;
      const dy = my - n.y;
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius) {
        hit = n;
        break;
      }
    }

    if (this.hoveredNode !== hit) {
      this.hoveredNode = hit;
      this.canvas.style.cursor = hit ? 'pointer' : 'grab';
      this.render();
    }
  }

  handleClick(e) {
    if (this.hoveredNode) {
      this.selectedNode = this.hoveredNode;
      this.options.onSelect(this.hoveredNode);
      this.render();
    }
  }
}
