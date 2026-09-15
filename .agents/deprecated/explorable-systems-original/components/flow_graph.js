/**
 * Explorable Systems: Interactive Flow Graph / State Machine Visualizer
 * For software architectures, distributed data flows, game loops, and protocols.
 * Supports pan, zoom, node selection, and state highlighting.
 */
class FlowGraphVisualizer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Container #${containerId} not found`);
    this.options = Object.assign({
      bg: '#f7f4ec',
      onNodeClick: (node) => {}
    }, options);

    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="flow-graph-wrapper" style="position:relative; width:100%; height:100%; overflow:hidden; background:${this.options.bg}; cursor:grab;">
        <svg class="flow-svg" style="position:absolute; width:3000px; height:2000px; transform-origin: 0 0;">
          <defs>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e1e1e" />
            </marker>
          </defs>
          <g class="flow-edges"></g>
          <g class="flow-nodes"></g>
        </svg>
        <div class="flow-controls" style="position:absolute; bottom:16px; right:16px; display:flex; gap:8px; background:rgba(255,255,255,0.9); padding:6px 12px; border-radius:8px; border:1px solid #1e1e1e; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
          <button class="btn-zoom-in" style="border:none; background:none; font-weight:bold; cursor:pointer; font-size:16px;">+</button>
          <button class="btn-zoom-out" style="border:none; background:none; font-weight:bold; cursor:pointer; font-size:16px;">−</button>
          <button class="btn-zoom-reset" style="border:none; background:none; font-size:12px; cursor:pointer;">Reset</button>
        </div>
      </div>
    `;

    this.wrapper = this.container.querySelector('.flow-graph-wrapper');
    this.svg = this.container.querySelector('.flow-svg');
    this.edgesGroup = this.container.querySelector('.flow-edges');
    this.nodesGroup = this.container.querySelector('.flow-nodes');

    this.bindEvents();
  }

  bindEvents() {
    this.wrapper.addEventListener('mousedown', (e) => {
      if (e.target.closest('.flow-controls') || e.target.closest('.flow-node')) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.wrapper.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.wrapper.style.cursor = 'grab';
    });

    this.wrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.scale = Math.min(2.5, Math.max(0.3, this.scale * zoomFactor));
      this.updateTransform();
    }, { passive: false });

    this.container.querySelector('.btn-zoom-in').onclick = () => { this.scale = Math.min(2.5, this.scale * 1.2); this.updateTransform(); };
    this.container.querySelector('.btn-zoom-out').onclick = () => { this.scale = Math.max(0.3, this.scale / 1.2); this.updateTransform(); };
    this.container.querySelector('.btn-zoom-reset').onclick = () => { this.scale = 1; this.panX = 0; this.panY = 0; this.updateTransform(); };
  }

  updateTransform() {
    this.svg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  renderData(nodes, edges) {
    this.nodesGroup.innerHTML = '';
    this.edgesGroup.innerHTML = '';

    // Render edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      const sx = source.x + source.width;
      const sy = source.y + source.height / 2;
      const tx = target.x;
      const ty = target.y + target.height / 2;
      const mx = (sx + tx) / 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', edge.color || '#1e1e1e');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('marker-end', 'url(#flow-arrow)');
      this.edgesGroup.appendChild(path);
    });

    // Render nodes
    nodes.forEach(node => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'flow-node');
      g.setAttribute('style', 'cursor: pointer;');
      g.onclick = () => this.options.onNodeClick(node);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x);
      rect.setAttribute('y', node.y);
      rect.setAttribute('width', node.width);
      rect.setAttribute('height', node.height);
      rect.setAttribute('rx', '8');
      rect.setAttribute('fill', node.bg || '#ffffff');
      rect.setAttribute('stroke', '#1e1e1e');
      rect.setAttribute('stroke-width', '2');
      g.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x + 16);
      text.setAttribute('y', node.y + 26);
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', '#1e1e1e');
      text.textContent = node.label;
      g.appendChild(text);

      this.nodesGroup.appendChild(g);
    });
  }
}
