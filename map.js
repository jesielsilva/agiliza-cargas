"use strict";

function createCoverageMap(cities) {
  const svg = document.querySelector("#coverage-map");
  const geography = document.querySelector("#map-geography");
  const markers = document.querySelector("#map-markers");
  const zoomIn = document.querySelector("#map-zoom-in");
  const zoomOut = document.querySelector("#map-zoom-out");
  const reset = document.querySelector("#map-reset");
  const status = document.querySelector("#map-status");
  const cityName = document.querySelector("#map-city-name");
  const cityDetail = document.querySelector("#map-city-detail");
  const cityLink = document.querySelector("#map-city-link");
  const namespace = "http://www.w3.org/2000/svg";
  const width = 600;
  const height = 440;
  // Mercator coordinates use the same projection for the IBGE outline and every locality.
  const project = (longitude, latitude) => [
    longitude,
    -Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360)) * 180 / Math.PI
  ];
  const projected = cities.map((city) => project(city.longitude, city.latitude));
  const minX = Math.min(...projected.map(([x]) => x));
  const maxX = Math.max(...projected.map(([x]) => x));
  const minY = Math.min(...projected.map(([, y]) => y));
  const maxY = Math.max(...projected.map(([, y]) => y));
  const scale = Math.min((width - 100) / (maxX - minX), (height - 75) / (maxY - minY));
  const toMap = (longitude, latitude) => {
    const [x, y] = project(longitude, latitude);
    return [(x - (minX + maxX) / 2) * scale + width / 2, (y - (minY + maxY) / 2) * scale + height / 2];
  };
  const boundary = document.createElementNS(namespace, "path");
  boundary.setAttribute("d", coverageGeography.boundary.map(([longitude, latitude], index) => {
    const [x, y] = toMap(longitude, latitude);
    return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z");
  boundary.classList.add("map-boundary");
  geography.append(boundary);

  const stateLabel = document.createElementNS(namespace, "text");
  stateLabel.setAttribute("x", "460");
  stateLabel.setAttribute("y", "115");
  stateLabel.classList.add("map-state-label");
  stateLabel.textContent = "MINAS GERAIS";
  geography.append(stateLabel);

  let zoom = 1;
  let center = [width / 2, height / 2];
  let selected = null;
  let drag = null;
  let suppressClick = false;
  const points = new Map();

  function drawView() {
    const viewWidth = width / zoom;
    const viewHeight = height / zoom;
    center[0] = Math.max(viewWidth / 2, Math.min(width - viewWidth / 2, center[0]));
    center[1] = Math.max(viewHeight / 2, Math.min(height - viewHeight / 2, center[1]));
    svg.setAttribute("viewBox", `${center[0] - viewWidth / 2} ${center[1] - viewHeight / 2} ${viewWidth} ${viewHeight}`);
    for (const [city, marker] of points) {
      marker.setAttribute("r", String((city === selected ? 7 : city.name === "Uberlândia" ? 6 : 4.5) / zoom));
    }
    zoomIn.disabled = zoom >= 8;
    zoomOut.disabled = zoom <= 1;
  }

  function clearSelection() {
    if (selected) points.get(selected).setAttribute("aria-pressed", "false");
    selected = null;
    cityName.textContent = "Explore nossa rede em Minas Gerais";
    cityDetail.textContent = "Selecione um ponto ou busque uma localidade na cobertura.";
    cityLink.hidden = true;
    cityLink.removeAttribute("href");
  }

  function select(city) {
    if (selected) points.get(selected).setAttribute("aria-pressed", "false");
    selected = city;
    const marker = points.get(city);
    marker.setAttribute("aria-pressed", "true");
    markers.append(marker);
    center = toMap(city.longitude, city.latitude);
    zoom = Math.max(zoom, 3);
    cityName.textContent = `${city.name} / MG`;
    cityDetail.textContent = city.name === "Uberlândia"
      ? "Base: Rua Bemira Montes Barroso, 657 · Jardim Maracanã. O ponto representa a sede da cidade."
      : "Localidade atendida em Minas Gerais. Confirme as condições com nossa equipe.";
    cityLink.href = "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(`${city.latitude},${city.longitude}`);
    cityLink.setAttribute("aria-label", `Ver ${city.name} no Google Maps (abre em nova aba)`);
    cityLink.hidden = false;
    drawView();
  }

  cities.forEach((city) => {
    const marker = document.createElementNS(namespace, "circle");
    const [x, y] = toMap(city.longitude, city.latitude);
    marker.setAttribute("cx", String(x));
    marker.setAttribute("cy", String(y));
    marker.setAttribute("role", "button");
    marker.setAttribute("tabindex", "0");
    marker.setAttribute("aria-label", `${city.name}, Minas Gerais`);
    marker.setAttribute("aria-pressed", "false");
    marker.dataset.city = city.name;
    marker.classList.add("map-marker");
    if (city.name === "Uberlândia") marker.classList.add("map-base-marker");
    const title = document.createElementNS(namespace, "title");
    title.textContent = `${city.name} / MG`;
    marker.append(title);
    marker.addEventListener("click", () => {
      if (!suppressClick) select(city);
    });
    marker.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        select(city);
      }
    });
    marker.addEventListener("focus", () => {
      center = toMap(city.longitude, city.latitude);
      drawView();
    });
    points.set(city, marker);
    markers.append(marker);
  });

  function setZoom(factor) {
    zoom = Math.max(1, Math.min(8, zoom * factor));
    drawView();
  }
  function resetView() {
    zoom = 1;
    center = [width / 2, height / 2];
    drawView();
  }
  zoomIn.addEventListener("click", () => setZoom(1.5));
  zoomOut.addEventListener("click", () => setZoom(1 / 1.5));
  reset.addEventListener("click", () => {
    document.querySelector("#city-search").value = "";
    document.querySelector("#city-search").dispatchEvent(new Event("input"));
    clearSelection();
    resetView();
  });
  reset.disabled = false;
  svg.addEventListener("keydown", (event) => {
    const offsets = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (offsets[event.key]) {
      event.preventDefault();
      const [x, y] = offsets[event.key];
      center[0] += x * 50 / zoom;
      center[1] += y * 50 / zoom;
      drawView();
    } else if (event.key === "+" || event.key === "=" || event.key === "-") {
      event.preventDefault();
      setZoom(event.key === "-" ? 1 / 1.5 : 1.5);
    } else if (event.key === "Home") {
      event.preventDefault();
      resetView();
    }
  });
  svg.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, center: [...center] };
    suppressClick = false;
  });
  svg.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!suppressClick && Math.hypot(dx, dy) < 5) return;
    suppressClick = true;
    svg.setPointerCapture(event.pointerId);
    const rect = svg.getBoundingClientRect();
    const unitsPerPixel = Math.max(width / rect.width, height / rect.height) / zoom;
    center = [drag.center[0] - dx * unitsPerPixel, drag.center[1] - dy * unitsPerPixel];
    drawView();
  });
  function endDrag(event) {
    if (drag?.id === event.pointerId) drag = null;
  }
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("lostpointercapture", endDrag);
  drawView();

  return {
    select,
    filter(matches) {
      const visible = new Set(matches);
      points.forEach((marker, city) => {
        marker.style.display = visible.has(city) ? "" : "none";
      });
      if (selected && !visible.has(selected)) clearSelection();
      status.textContent = `${matches.length} de ${cities.length} localidades no mapa`;
      if (matches.length === 1) select(matches[0]);
      else resetView();
    }
  };
}
