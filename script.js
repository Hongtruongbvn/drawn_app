class Layer {
            constructor(name, opacity = 1) {
                this.name = name;
                this.canvas = document.createElement('canvas');
                this.canvas.width = 800;
                this.canvas.height = 600;
                this.ctx = this.canvas.getContext('2d');
                this.opacity = opacity;
                this.visible = true;
                this.id = Date.now() + Math.random();
            }

            clear() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }

            duplicate() {
                const newLayer = new Layer(this.name + ' Copy', this.opacity);
                newLayer.ctx.drawImage(this.canvas, 0, 0);
                return newLayer;
            }
        }

        class BrushTexture {
            constructor() {
                this.textureCanvas = document.getElementById('textureCanvas');
                this.textureCtx = this.textureCanvas.getContext('2d');
                this.currentTexture = 'solid';
            }

            generateTexture(type, size, color) {
                const canvas = document.createElement('canvas');
                canvas.width = size * 2;
                canvas.height = size * 2;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = color;
                
                switch(type) {
                    case 'solid':
                        ctx.beginPath();
                        ctx.arc(size, size, size, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 'dots':
                        const dotCount = Math.max(3, Math.floor(size / 3));
                        for (let i = 0; i < dotCount; i++) {
                            const x = Math.random() * size * 2;
                            const y = Math.random() * size * 2;
                            const r = Math.random() * size / 4 + 1;
                            ctx.beginPath();
                            ctx.arc(x, y, r, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'lines':
                        ctx.lineWidth = Math.max(1, size / 10);
                        for (let i = 0; i < size / 2; i++) {
                            ctx.beginPath();
                            ctx.moveTo(i * 4, 0);
                            ctx.lineTo(i * 4, size * 2);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'crosshatch':
                        ctx.lineWidth = Math.max(1, size / 15);
                        for (let i = -size; i < size * 3; i += 4) {
                            ctx.beginPath();
                            ctx.moveTo(i, 0);
                            ctx.lineTo(i + size * 2, size * 2);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.moveTo(i, size * 2);
                            ctx.lineTo(i + size * 2, 0);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'spray':
                        const sprayCount = size * 3;
                        for (let i = 0; i < sprayCount; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const distance = Math.random() * size;
                            const x = size + Math.cos(angle) * distance;
                            const y = size + Math.sin(angle) * distance;
                            ctx.beginPath();
                            ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                        
                    case 'fur':
                        const furCount = Math.max(5, size);
                        for (let i = 0; i < furCount; i++) {
                            const x = Math.random() * size * 2;
                            const y = Math.random() * size * 2;
                            const length = Math.random() * size / 2 + size / 4;
                            const angle = Math.random() * Math.PI * 2;
                            
                            ctx.lineWidth = Math.random() * 2 + 0.5;
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
                            ctx.stroke();
                        }
                        break;
                        
                    case 'stars':
                        const starCount = Math.max(3, Math.floor(size / 8));
                        for (let i = 0; i < starCount; i++) {
                            const x = Math.random() * size * 2;
                            const y = Math.random() * size * 2;
                            const starSize = Math.random() * size / 4 + 2;
                            this.drawStar(ctx, x, y, 5, starSize, starSize / 2);
                        }
                        break;
                        
                    case 'noise':
                        const imageData = ctx.createImageData(size * 2, size * 2);
                        const data = imageData.data;
                        const rgb = this.hexToRgb(color);
                        
                        for (let i = 0; i < data.length; i += 4) {
                            if (Math.random() > 0.7) {
                                data[i] = rgb.r;
                                data[i + 1] = rgb.g;
                                data[i + 2] = rgb.b;
                                data[i + 3] = Math.random() * 255;
                            }
                        }
                        ctx.putImageData(imageData, 0, 0);
                        break;
                        
                    case 'watercolor':
                        ctx.globalAlpha = 0.3;
                        const layers = 5;
                        for (let i = 0; i < layers; i++) {
                            const radius = size * (1 - i * 0.1);
                            const offsetX = (Math.random() - 0.5) * size / 2;
                            const offsetY = (Math.random() - 0.5) * size / 2;
                            ctx.beginPath();
                            ctx.arc(size + offsetX, size + offsetY, radius, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = 1;
                        break;
                }
                
                return canvas;
            }

            drawStar(ctx, x, y, spikes, outerRadius, innerRadius) {
                let rot = Math.PI / 2 * 3;
                let step = Math.PI / spikes;
                
                ctx.beginPath();
                ctx.moveTo(x, y - outerRadius);
                
                for (let i = 0; i < spikes; i++) {
                    ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
                    rot += step;
                    ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
                    rot += step;
                }
                
                ctx.lineTo(x, y - outerRadius);
                ctx.closePath();
                ctx.fill();
            }

            hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : { r: 0, g: 0, b: 0 };
            }
        }

        class PaintApplication {
            constructor() {
                this.canvas = document.getElementById('paintCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.isDrawing = false;
                this.currentTool = 'brush';
                this.currentColor = '#3498db';
                this.currentSize = 5;
                this.startX = 0;
                this.startY = 0;
                
                // Layer system
                this.layers = [];
                this.currentLayerIndex = 0;
                this.initializeLayers();
                
                // Texture system
                this.brushTexture = new BrushTexture();
                
                // Undo/Redo functionality
                this.undoStack = [];
                this.redoStack = [];
                this.maxUndoSteps = 20;
                
                // Shape drawing
                this.tempCanvas = document.createElement('canvas');
                this.tempCtx = this.tempCanvas.getContext('2d');
                this.tempCanvas.width = this.canvas.width;
                this.tempCanvas.height = this.canvas.height;
                
                this.initializeEventListeners();
                this.saveState();
                this.updateBrushPreview();
                this.renderLayers();
            }

            initializeLayers() {
                // Create background layer
                const backgroundLayer = new Layer('Background');
                this.layers.push(backgroundLayer);
                this.updateLayerPanel();
            }

            initializeEventListeners() {
                // Tool selection
                document.getElementById('brushTool').addEventListener('click', () => this.selectTool('brush'));
                document.getElementById('eraserTool').addEventListener('click', () => this.selectTool('eraser'));
                document.getElementById('lineTool').addEventListener('click', () => this.selectTool('line'));
                document.getElementById('rectangleTool').addEventListener('click', () => this.selectTool('rectangle'));
                document.getElementById('circleTool').addEventListener('click', () => this.selectTool('circle'));

                // Canvas events
                this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
                this.canvas.addEventListener('mousemove', (e) => this.draw(e));
                this.canvas.addEventListener('mouseup', () => this.stopDrawing());
                this.canvas.addEventListener('mouseout', () => this.stopDrawing());
                this.canvas.addEventListener('mousemove', (e) => this.updateMouseCoordinates(e));

                // Touch events
                this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e, 'start'));
                this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e, 'move'));
                this.canvas.addEventListener('touchend', (e) => this.handleTouch(e, 'end'));

                // Controls
                document.getElementById('brushSize').addEventListener('input', (e) => this.updateBrushSize(e.target.value));
                document.getElementById('colorPicker').addEventListener('change', (e) => this.updateColor(e.target.value));
                
                // Quick color buttons
                document.getElementById('colorBlack').addEventListener('click', () => this.updateColor('#000000'));
                document.getElementById('colorRed').addEventListener('click', () => this.updateColor('#e74c3c'));
                document.getElementById('colorBlue').addEventListener('click', () => this.updateColor('#3498db'));

                // Action buttons
                document.getElementById('clearLayer').addEventListener('click', () => this.clearCurrentLayer());
                document.getElementById('undoBtn').addEventListener('click', () => this.undo());
                document.getElementById('redoBtn').addEventListener('click', () => this.redo());
                document.getElementById('saveImage').addEventListener('click', () => this.saveImage());

                // Layer controls
                document.getElementById('addLayer').addEventListener('click', () => this.addLayer());
                document.getElementById('duplicateLayer').addEventListener('click', () => this.duplicateCurrentLayer());
                document.getElementById('deleteLayer').addEventListener('click', () => this.deleteCurrentLayer());

                // Texture selection
                document.querySelectorAll('.texture-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.selectTexture(e.target.dataset.texture));
                });

                // Keyboard shortcuts
                document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
            }

            selectTool(tool) {
                document.querySelectorAll('#brushTool, #eraserTool, #lineTool, #rectangleTool, #circleTool').forEach(btn => btn.classList.remove('active'));
                document.getElementById(tool + 'Tool').classList.add('active');
                
                this.currentTool = tool;
                document.getElementById('currentTool').textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
                this.canvas.style.cursor = tool === 'eraser' ? 'not-allowed' : 'crosshair';
            }

            selectTexture(texture) {
                document.querySelectorAll('.texture-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`[data-texture="${texture}"]`).classList.add('active');
                this.brushTexture.currentTexture = texture;
                this.updateBrushPreview();
            }

            updateBrushSize(size) {
                this.currentSize = size;
                document.getElementById('sizeDisplay').textContent = size + 'px';
                document.getElementById('currentSize').textContent = size + 'px';
                this.updateBrushPreview();
            }

            updateColor(color) {
                this.currentColor = color;
                document.getElementById('colorPicker').value = color;
                this.updateBrushPreview();
            }

            updateBrushPreview() {
                const preview = document.getElementById('brushPreview');
                preview.style.background = this.currentTool === 'eraser' ? '#ffffff' : this.currentColor;
                preview.style.width = Math.min(30, this.currentSize / 2 + 10) + 'px';
                preview.style.height = Math.min(30, this.currentSize / 2 + 10) + 'px';
                preview.style.border = this.currentTool === 'eraser' ? '2px solid #e74c3c' : '2px solid white';
            }

            addLayer() {
                const newLayer = new Layer(`Layer ${this.layers.length + 1}`);
                this.layers.push(newLayer);
                this.currentLayerIndex = this.layers.length - 1;
                this.updateLayerPanel();
                this.renderLayers();
                this.saveState();
            }

            duplicateCurrentLayer() {
                if (this.layers.length > 0) {
                    const currentLayer = this.layers[this.currentLayerIndex];
                    const duplicatedLayer = currentLayer.duplicate();
                    this.layers.splice(this.currentLayerIndex + 1, 0, duplicatedLayer);
                    this.currentLayerIndex++;
                    this.updateLayerPanel();
                    this.renderLayers();
                    this.saveState();
                }
            }

            deleteCurrentLayer() {
                if (this.layers.length > 1) {
                    this.layers.splice(this.currentLayerIndex, 1);
                    this.currentLayerIndex = Math.min(this.currentLayerIndex, this.layers.length - 1);
                    this.updateLayerPanel();
                    this.renderLayers();
                    this.saveState();
                }
            }

            updateLayerPanel() {
                const layerList = document.getElementById('layerList');
                layerList.innerHTML = '';

                this.layers.forEach((layer, index) => {
                    const layerItem = document.createElement('div');
                    layerItem.className = `layer-item ${index === this.currentLayerIndex ? 'active' : ''}`;
                    
                    layerItem.innerHTML = `
                        <div class="layer-header" onclick="paintApp.selectLayer(${index})">
                            <span class="layer-name">${layer.name}</span>
                            <div class="layer-controls">
                                <button onclick="event.stopPropagation(); paintApp.toggleLayerVisibility(${index})" 
                                        style="background: ${layer.visible ? '#27ae60' : '#e74c3c'}">
                                    ${layer.visible ? '👁' : '🚫'}
                                </button>
                            </div>
                        </div>
                        <div class="opacity-control">
                            <label>Opacity: ${Math.round(layer.opacity * 100)}%</label>
                            <input type="range" min="0" max="1" step="0.1" value="${layer.opacity}" 
                                   onchange="paintApp.updateLayerOpacity(${index}, this.value)">
                        </div>
                    `;
                    
                    layerList.appendChild(layerItem);
                });

                document.getElementById('currentLayer').textContent = this.layers[this.currentLayerIndex]?.name || 'None';
            }

            selectLayer(index) {
                this.currentLayerIndex = index;
                this.updateLayerPanel();
            }

            toggleLayerVisibility(index) {
                this.layers[index].visible = !this.layers[index].visible;
                this.updateLayerPanel();
                this.renderLayers();
            }

            updateLayerOpacity(index, opacity) {
                this.layers[index].opacity = parseFloat(opacity);
                this.updateLayerPanel();
                this.renderLayers();
            }

            renderLayers() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.layers.forEach(layer => {
                    if (layer.visible) {
                        this.ctx.globalAlpha = layer.opacity;
                        this.ctx.drawImage(layer.canvas, 0, 0);
                    }
                });
                
                this.ctx.globalAlpha = 1;
            }

            getCurrentLayerContext() {
                return this.layers[this.currentLayerIndex]?.ctx || this.ctx;
            }

            getMousePos(e) {
                const rect = this.canvas.getBoundingClientRect();
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.y
                };
            }

            startDrawing(e) {
                this.isDrawing = true;
                const pos = this.getMousePos(e);
                this.startX = pos.x;
                this.startY = pos.y;

                const layerCtx = this.getCurrentLayerContext();

                if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
                    if (this.brushTexture.currentTexture === 'solid' || this.currentTool === 'eraser') {
                        layerCtx.beginPath();
                        layerCtx.moveTo(pos.x, pos.y);
                    }
                }

                if (['line', 'rectangle', 'circle'].includes(this.currentTool)) {
                    this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
                    this.tempCtx.drawImage(this.layers[this.currentLayerIndex].canvas, 0, 0);
                }
            }

            draw(e) {
                if (!this.isDrawing) return;

                const pos = this.getMousePos(e);
                const layerCtx = this.getCurrentLayerContext();

                switch (this.currentTool) {
                    case 'brush':
                        if (this.brushTexture.currentTexture === 'solid') {
                            this.setupBrush(layerCtx);
                            layerCtx.lineTo(pos.x, pos.y);
                            layerCtx.stroke();
                        } else {
                            this.drawTexturedBrush(layerCtx, pos.x, pos.y);
                        }
                        break;
                    case 'eraser':
                        this.setupBrush(layerCtx);
                        layerCtx.lineTo(pos.x, pos.y);
                        layerCtx.stroke();
                        break;
                    case 'line':
                        this.drawLine(this.startX, this.startY, pos.x, pos.y);
                        break;
                    case 'rectangle':
                        this.drawRectangle(this.startX, this.startY, pos.x, pos.y);
                        break;
                    case 'circle':
                        this.drawCircle(this.startX, this.startY, pos.x, pos.y);
                        break;
                }

                this.renderLayers();
            }

            drawTexturedBrush(ctx, x, y) {
                const textureCanvas = this.brushTexture.generateTexture(
                    this.brushTexture.currentTexture, 
                    this.currentSize, 
                    this.currentColor
                );
                
                ctx.globalAlpha = 0.7;
                ctx.drawImage(textureCanvas, x - this.currentSize, y - this.currentSize);
                ctx.globalAlpha = 1;
            }

            setupBrush(ctx) {
                ctx.lineWidth = this.currentSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                
                if (this.currentTool === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = this.currentColor;
                    ctx.fillStyle = this.currentColor;
                }
            }

            drawLine(x1, y1, x2, y2) {
                const layerCtx = this.getCurrentLayerContext();
                layerCtx.clearRect(0, 0, this.layers[this.currentLayerIndex].canvas.width, this.layers[this.currentLayerIndex].canvas.height);
                layerCtx.drawImage(this.tempCanvas, 0, 0);
                
                this.setupBrush(layerCtx);
                layerCtx.beginPath();
                layerCtx.moveTo(x1, y1);
                layerCtx.lineTo(x2, y2);
                layerCtx.stroke();
            }

            drawRectangle(x1, y1, x2, y2) {
                const layerCtx = this.getCurrentLayerContext();
                layerCtx.clearRect(0, 0, this.layers[this.currentLayerIndex].canvas.width, this.layers[this.currentLayerIndex].canvas.height);
                layerCtx.drawImage(this.tempCanvas, 0, 0);
                
                this.setupBrush(layerCtx);
                const width = x2 - x1;
                const height = y2 - y1;
                layerCtx.strokeRect(x1, y1, width, height);
            }

            drawCircle(x1, y1, x2, y2) {
                const layerCtx = this.getCurrentLayerContext();
                layerCtx.clearRect(0, 0, this.layers[this.currentLayerIndex].canvas.width, this.layers[this.currentLayerIndex].canvas.height);
                layerCtx.drawImage(this.tempCanvas, 0, 0);
                
                this.setupBrush(layerCtx);
                const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                layerCtx.beginPath();
                layerCtx.arc(x1, y1, radius, 0, 2 * Math.PI);
                layerCtx.stroke();
            }

            stopDrawing() {
                if (this.isDrawing) {
                    this.isDrawing = false;
                    this.saveState();
                    this.renderLayers();
                }
            }

            saveState() {
                this.redoStack = [];
                const state = {
                    layers: this.layers.map(layer => ({
                        name: layer.name,
                        opacity: layer.opacity,
                        visible: layer.visible,
                        imageData: layer.canvas.toDataURL()
                    })),
                    currentLayerIndex: this.currentLayerIndex
                };
                
                this.undoStack.push(JSON.stringify(state));
                
                if (this.undoStack.length > this.maxUndoSteps) {
                    this.undoStack.shift();
                }
            }

            undo() {
                if (this.undoStack.length > 1) {
                    this.redoStack.push(this.undoStack.pop());
                    this.restoreState(JSON.parse(this.undoStack[this.undoStack.length - 1]));
                }
            }

            redo() {
                if (this.redoStack.length > 0) {
                    const state = this.redoStack.pop();
                    this.undoStack.push(state);
                    this.restoreState(JSON.parse(state));
                }
            }

            restoreState(state) {
                this.layers = [];
                this.currentLayerIndex = state.currentLayerIndex;
                
                state.layers.forEach(layerData => {
                    const layer = new Layer(layerData.name, layerData.opacity);
                    layer.visible = layerData.visible;
                    
                    const img = new Image();
                    img.onload = () => {
                        layer.ctx.drawImage(img, 0, 0);
                        this.renderLayers();
                    };
                    img.src = layerData.imageData;
                    
                    this.layers.push(layer);
                });
                
                this.updateLayerPanel();
                this.renderLayers();
            }

            clearCurrentLayer() {
                if (this.layers[this.currentLayerIndex]) {
                    this.layers[this.currentLayerIndex].clear();
                    this.renderLayers();
                    this.saveState();
                }
            }

            saveImage() {
                // Create a temporary canvas to flatten all layers
                const flatCanvas = document.createElement('canvas');
                flatCanvas.width = this.canvas.width;
                flatCanvas.height = this.canvas.height;
                const flatCtx = flatCanvas.getContext('2d');
                
                // Fill with white background
                flatCtx.fillStyle = 'white';
                flatCtx.fillRect(0, 0, flatCanvas.width, flatCanvas.height);
                
                // Draw all visible layers
                this.layers.forEach(layer => {
                    if (layer.visible) {
                        flatCtx.globalAlpha = layer.opacity;
                        flatCtx.drawImage(layer.canvas, 0, 0);
                    }
                });
                
                flatCtx.globalAlpha = 1;
                
                const link = document.createElement('a');
                link.download = 'layered_artwork_' + Date.now() + '.png';
                link.href = flatCanvas.toDataURL();
                link.click();
            }

            updateMouseCoordinates(e) {
                const pos = this.getMousePos(e);
                document.getElementById('mouseCoords').textContent = `Mouse: (${Math.round(pos.x)}, ${Math.round(pos.y)})`;
            }

            handleTouch(e, action) {
                e.preventDefault();
                const touch = e.touches[0] || e.changedTouches[0];
                const mouseEvent = new MouseEvent(action === 'start' ? 'mousedown' : action === 'move' ? 'mousemove' : 'mouseup', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                this.canvas.dispatchEvent(mouseEvent);
            }

            handleKeyboardShortcuts(e) {
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key.toLowerCase()) {
                        case 'z':
                            e.preventDefault();
                            if (e.shiftKey) {
                                this.redo();
                            } else {
                                this.undo();
                            }
                            break;
                        case 's':
                            e.preventDefault();
                            this.saveImage();
                            break;
                        case 'l':
                            e.preventDefault();
                            this.addLayer();
                            break;
                    }
                }
                
                // Tool shortcuts
                switch (e.key.toLowerCase()) {
                    case 'b':
                        this.selectTool('brush');
                        break;
                    case 'e':
                        this.selectTool('eraser');
                        break;
                    case 'l':
                        if (!e.ctrlKey && !e.metaKey) this.selectTool('line');
                        break;
                    case 'r':
                        this.selectTool('rectangle');
                        break;
                    case 'c':
                        this.selectTool('circle');
                        break;
                    case 'delete':
                        this.clearCurrentLayer();
                        break;
                }
            }
        }

        // Global variable for layer panel callbacks
        let paintApp;

        // Initialize the application when page loads
        document.addEventListener('DOMContentLoaded', () => {
            paintApp = new PaintApplication();
        });