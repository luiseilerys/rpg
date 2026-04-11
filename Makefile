# Makefile para The First Dungeon - Webxdc Edition

.PHONY: all clean build test help

XDC_FILE = the-first-dungeon.xdc
SRC_FILES = index.html manifest.toml webxdc.js
SRC_DIRS = src assets

all: help

help:
	@echo "The First Dungeon - Webxdc Build System"
	@echo ""
	@echo "Comandos:"
	@echo "  make build  - Construir archivo .xdc"
	@echo "  make test   - Abrir en navegador"
	@echo "  make clean  - Limpiar archivos"

build: $(XDC_FILE)

$(XDC_FILE): $(SRC_FILES) $(SRC_DIRS)
	@echo "Construyendo $(XDC_FILE)..."
	@zip -rq $(XDC_FILE) $(SRC_FILES) $(SRC_DIRS) --exclude "*.DS_Store" "*.git*" "*.log"
	@echo "Build completado!"
	@ls -lh $(XDC_FILE)

test:
	@echo "Abriendo en navegador..."
	@python3 -c "import webbrowser; webbrowser.open('file://$(PWD)/index.html')" 2>/dev/null || echo "Abre index.html manualmente"

clean:
	@rm -f $(XDC_FILE) *.zip
	@echo "Limpieza completada"
