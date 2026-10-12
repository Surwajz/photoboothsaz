import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import "./Photobooth.css";
import {
    FRAME_HEIGHT,
    FRAME_WIDTH,
    getCoverGeometry,
    getFrameSlots
} from "./photoGeometry";

const frameOptions = [
    "/assets/frames/heart-frame.png",
    "/assets/frames/heart-frame-2.png",
    "/assets/frames/heart-frame-3.png",
    "/assets/frames/heart-frame-4.png",
    "/assets/frames/heart-frame-5.png",
    "/assets/frames/heart-frame-6.png",
];

const stickerOptions = [
    "/assets/stickers/leaf.png",
    "/assets/stickers/sparkles.png",
    "/assets/stickers/star.png",
    "/assets/stickers/puppy.png",
];

// Prefer a stream near the horizontal frame-slot aspect ratio when available.
const videoConstraints = {
    width: { ideal: 953 },
    height: { ideal: 599 },
    facingMode: "user"
};
export default function PhotoBooth() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const frameImgRef = useRef(null);

    const [selectedFrame, setSelectedFrame] = useState(null);
    const [mode, setMode] = useState("photo");

    const [photos, setPhotos] = useState([]);
    const [photoCount, setPhotoCount] = useState(0);
    const [canTakePhoto, setCanTakePhoto] = useState(true);
    const [draggingPhoto, setDraggingPhoto] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [countdown, setCountdown] = useState(null);

    const [stickers, setStickers] = useState([]);
    const [draggingSticker, setDraggingSticker] = useState(null);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const [frameReady, setFrameReady] = useState(false);

    const getActiveSlots = () => {
        const frame = frameImgRef.current;
        return getFrameSlots(
            frame ? frame.width : FRAME_WIDTH,
            frame ? frame.height : FRAME_HEIGHT
        );
    };

    // frames
    useEffect(() => {
        if (!selectedFrame) return;
        setFrameReady(false);

        const img = document.createElement("img");
        img.src = selectedFrame;

        img.onload = () => {
            frameImgRef.current = img;
            setFrameReady(true);
        };
        img.onerror = () => setFrameReady(false);
    }, [selectedFrame]);

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !frameImgRef.current || !frameReady) return;

        const ctx = canvas.getContext("2d");

        const frameWidth = frameImgRef.current.width;
        const frameHeight = frameImgRef.current.height;
        const activeSlots = getFrameSlots(frameWidth, frameHeight);
        canvas.width = frameWidth;
        canvas.height = frameHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        photos.forEach(p => {
            const slot = activeSlots[p.slotIndex];
            const drawW = p.img.width * p.scale;
            const drawH = p.img.height * p.scale;
            const dx = slot.x + p.offsetX;
            const dy = slot.y + p.offsetY;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(slot.x, slot.y);
            ctx.lineTo(slot.x + slot.width, slot.y);
            ctx.lineTo(slot.x + slot.width, slot.y + slot.height);
            ctx.lineTo(slot.x, slot.y + slot.height);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(p.img, dx, dy, drawW, drawH);
            ctx.restore();
        });
        ctx.drawImage(frameImgRef.current, 0, 0, frameWidth, frameHeight);

        stickers.forEach((s, i) => {
            ctx.drawImage(s.img, s.x, s.y, 150, 150);
            if (i === selectedSticker) {
                ctx.strokeStyle = "#ff7aa2";
                ctx.lineWidth = 4;
                ctx.strokeRect(s.x, s.y, 150, 150);
            }
        });
    };

    useEffect(drawCanvas, [photos, stickers, selectedSticker, photoCount, frameReady]);

    const handleBack = () => {
        if (mode === "decorate") {
            setMode("photo");
            setCanTakePhoto(false);
            setStickers([]);
            setSelectedSticker(null);
        } else {
            setSelectedFrame(null);
            setPhotos([]);
            setPhotoCount(0);
            setStickers([]);
            setSelectedSticker(null);
            setMode("photo");
            setCanTakePhoto(true);
        }
    };

    // photos
    const addPhoto = img => {
        if (photoCount >= 4) return;

        const slot = getActiveSlots()[photoCount];
        const { scale, offsetX, offsetY } = getCoverGeometry(
            img.naturalWidth || img.width,
            img.naturalHeight || img.height,
            slot.width,
            slot.height
        );

        setPhotos(p => [
            ...p,
            { img, slotIndex: photoCount, scale, offsetX, offsetY }
        ]);

        setCanTakePhoto(true);

        setPhotoCount(c => {
            const next = c + 1;
            if (next === 4) setMode("decorate");
            return next;
        });
    };

    const takePhotoNow = () => {
        if (!webcamRef.current) return;
        // Keep the camera's intrinsic dimensions so portrait captures are not stretched.
        const src = webcamRef.current();
        if (!src) return;
        const img = document.createElement("img");
        img.src = src;
        img.onload = () => addPhoto(img);
        img.onerror = () => {};
    };

    const capturePhoto = () => {
        if (!canTakePhoto || countdown !== null) return;

        setCanTakePhoto(false);
        setCountdown(3);

        let current = 3;
        const interval = setInterval(() => {
            current -= 1;

            if (current === 0) {
                clearInterval(interval);
                setCountdown(null);
                takePhotoNow();
            } else {
                setCountdown(current);
            }
        }, 1000);
    };

    const uploadPhoto = e => {
        const file = e.target.files[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        const img = document.createElement("img");
        img.src = objectUrl;
        img.onload = () => {
            addPhoto(img);
            URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => URL.revokeObjectURL(objectUrl);
        e.target.value = "";
    };

    const redoLastPhoto = () => {
        if (!photos.length) return;
        setPhotos(p => p.slice(0, -1));
        setPhotoCount(c => Math.max(0, c - 1));
        setCanTakePhoto(true);
    };

    const getCoords = e => {
        const r = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (canvasRef.current.width / r.width),
            y: (e.clientY - r.top) * (canvasRef.current.height / r.height)
        };
    };

    // drag photos
    const handlePointerDown = e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const { x, y } = getCoords(e);
        if (mode === "photo") {
            for (let i = photos.length - 1; i >= 0; i--) {
                const p = photos[i];
                const slot = getActiveSlots()[p.slotIndex];
                const w = p.img.width * p.scale;
                const h = p.img.height * p.scale;

                if(
                    x >= slot.x + p.offsetX &&
                    x <= slot.x + p.offsetX + w &&
                    y >= slot.y + p.offsetY &&
                    y <= slot.y + p.offsetY + h
                ) {
                    setDraggingPhoto(i);
                    setDragOffset({
                        x: x - slot.x - p.offsetX,
                        y: y - slot.y - p.offsetY
                    });
                    return;
                }

            }
        }

        if (mode === "decorate") {
            for(let i = stickers.length - 1; i >= 0; i --){
                const s = stickers[i];
                if (x >= s.x && x <= s.x + 150 && y>= s.y && y <= s.y + 150) {
                    setDraggingSticker(i);
                    setSelectedSticker(i);
                    setDragOffset({x: x-s.x, y: y-s.y});
                    return;
                }
            }
        }
    };

    const handlePointerMove = e => {
        const {x,y} = getCoords(e);

        if (draggingPhoto !== null && mode === "photo") {
            setPhotos(prev => {
                const updated = [...prev];
                const p = updated[draggingPhoto];
                const slot = getActiveSlots()[p.slotIndex];
                const w = p.img.width * p.scale;
                const h = p.img.height * p.scale;

                p.offsetX = x - slot.x - dragOffset.x;
                p.offsetY = y - slot.y - dragOffset.y;
                p.offsetX = Math.min(Math.max(p.offsetX, slot.width - w), 0);
                p.offsetY = Math.min(Math.max(p.offsetY, slot.height - h), 0);

                return updated;
            });
        }

        if (draggingSticker !== null && mode === "decorate") {
            setStickers(s => {
                const u = [...s];
                u[draggingSticker] = {
                    ...u[draggingSticker],
                    x: x - dragOffset.x,
                    y: y - dragOffset.y
                };
                return u;
            });
        }
    };

    const handlePointerUp = () => {
        setDraggingPhoto(null);
        setDraggingSticker(null);
    };

    // add Sticker
    const addSticker = src => {
        const img = document.createElement("img");
        img.src = src;
        img.onload = () =>
            setStickers(s => [...s, { img, x: 400, y: 100 }]);
    };

    // delete Sticker
    useEffect(() => {
        const handleKeyDown = e => {
            if (
                (e.key === "Delete" || e.key === "Backspace") &&
                selectedSticker !== null &&
                mode === "decorate"
            ){
                setStickers(s => s.filter((_, i) => i !== selectedSticker));
                setSelectedSticker(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedSticker,mode]);

    //download

    const downloadPhoto = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageUrl = canvas.toDataURL("image/png");
        if (navigator.share && navigator.canShare && typeof File !== "undefined") {
            const base64 = imageUrl.split(",")[1];
            const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
            const file = new File([bytes], "photo-homie.png", { type: "image/png" });

            if (navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: "Homie Photobooth" });
                    return;
                } catch (error) {
                    if (error.name === "AbortError") return;
                }
            }
        }

        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = "photo-homie.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className="photobooth-shell" style={centerCol}>
            {/* top bar with back btn and text */}
            <div className="photobooth-topbar" style={topBar}>
                {selectedFrame && (
                    <button
                        style={{
                            ...buttonStyle,
                            position: "absolute",
                            left: 0,
                            top: 10,
                            height: 40,
                            padding: "0 16px",
                            lineHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    onClick={handleBack}
                    > ← Back</button>
                )}

                <h1 style={titleBar}>
                    {!selectedFrame
                        ? "₊✩‧₊˚ Select a frame౨ৎ ˚₊✩‧₊"
                        : mode === "photo"
                            ? "⋆｡‧˚ʚ Smile :)ɞ˚‧｡⋆"
                            : ". ݁₊ ⊹ . ݁Let’s decorate . ⊹ ₊ ݁."}

                </h1>
            </div>
            <div className="photobooth-content" style={mainContent} >
                {!selectedFrame ? (
                    <div className="frame-picker" style={{ display: "flex", gap: 24 }}>
                        {frameOptions.map((src) => {
                            const isSelected = selectedFrame === src;

                            return (
                                <img
                                    key={src}
                                    src={src}
                                    alt="frame"
                                    onClick={() => setSelectedFrame(src)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.08)";
                                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(255,122,162,0.45)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = frameThumb.boxShadow;

                                    }}
                                    style={{
                                        ...frameThumb,
                                        transform: isSelected ? "scale(1.08)" : "scale(1)",
                                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                        boxShadow: isSelected ? "0 12px 30px rgba(255,122,162,0.45)" : frameThumb.boxShadow,
                                    }}

                                />
                            )
                        })}
                    </div>
                ) : (
                    <div className="photobooth-layout" style={row}>
                        <div className="photobooth-controls">
                            {mode === "photo" && (
                                <>
                                    <div className="camera-preview" style={{ position: "relative", width: 400 }}>
                                        {/* Webcam */}
                                        <Webcam
                                            audio={false}
                                            screenshotFormat="image/png"
                                            videoConstraints={videoConstraints}
                                            mirrored={true}
                                            style={{ width: "100%", borderRadius: 12 }}
                                        >
                                            {({ getScreenshot }) => {
                                                // react-webcam exposes getScreenshot() through its render-props
                                                // API. (Passing `ref` to <Webcam> would override the library's
                                                // internal ref callback and silently break screenshots.)
                                                webcamRef.current = getScreenshot;
                                                return null;
                                            }}
                                        </Webcam>

                                        {/* Overlay countdown */}

                                        {countdown !== null && (
                                            <div style = {{
                                                position: "absolute",
                                                inset: 0,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 96,
                                                fontWeight: "bold",
                                                color: "white",
                                                textShadow: "0 4px 20px rgba(0,0,0,0.6)",
                                                background: "rgba(0,0,0,0.25)",
                                                borderRadius: 12,
                                                pointerEvents: "none",
                                            }}
                                            >
                                                {countdown}
                                                </div>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="photo-actions" style={{ marginTop: 16, display: "flex", gap: 12 }}>
                                        {canTakePhoto && (
                                            <>
                                                <button style={buttonStyle} onClick={capturePhoto} disabled={!frameReady}>
                                                    Take Photo
                                                </button>
                                                <label style={{...buttonStyle, cursor: "pointer"}}>
                                                    Upload
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={!frameReady}
                                                        onChange={uploadPhoto}
                                                        style={{ display: "none"}}
                                                        />
                                                </label>
                                            </>
                                        )}
                                        {/* redo btn */}
                                        {photoCount > 0 && (
                                            <button style={{
                                                ...buttonStyle,
                                                fontSize: 22,
                                                padding: "4px 10px"
                                            }}
                                            onClick = {redoLastPhoto}
                                            >
                                                ⟳
                                            </button>
                                        )}

                                    </div>
                                </>
                            )}

                            {mode === "decorate" && (
                                <div className="sticker-picker">
                                    {stickerOptions.map((src) => (
                                        <img
                                            key={src}
                                            src={src}
                                            alt="sticker"
                                            onClick={() => addSticker(src)}
                                            className="sticker-option"
                                            style={{ width: 50, cursor: "pointer"}}
                                        />
                                    ))}
                                    <button
                                        type="button"
                                        className="mobile-remove-sticker"
                                        disabled={selectedSticker === null}
                                        onClick={() => {
                                            if (selectedSticker === null) return;
                                            setStickers(current => current.filter((_, i) => i !== selectedSticker));
                                            setSelectedSticker(null);
                                        }}
                                    >
                                        Remove selected
                                    </button>
                                </div>
                            )
                            }
                        </div>

                        {/* Display frame */}
                            <div>
                                <canvas ref={canvasRef}
                                className="photo-canvas"
                                style={{
                                    width: 200,
                                    height: 500,
                                    borderRadius: 16,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                }}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                />

                                {mode === "decorate" && (
                                <div style={{
                                    marginTop: 16,
                                    display:"flex",
                                    justifyContent: "center",
                                }}>
                                    <button style={buttonStyle} onClick={downloadPhoto}>
                                        Download
                                    </button>
                                </div>
                                )}
                            </div>
                    </div>
                )
                }
            </div>
        </div>
    )
}

// styles
const centerCol = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20
};
const topBar = {
    width: 700,
    height: 60,
    position: "relative",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}
const buttonStyle = {
    padding: "10px 20px",
    fontSize: 20,
    cursor: "pointer",
    fontFamily: "CantikaCute",
    color: "#8c5b4a",
    border: "2px solid #8c5b4a",
    borderRadius: 8,
    background: "white"
};

const row = { display: "flex", gap: 40, alignItems: "flex-start" };
const frameThumb = {
    width: 180,
    cursor: "pointer",
    borderRadius: 12,
    boxShadow: "0 8px 8px rgba(0,0,0,0.15)"
};

const titleBar = {
    margin: 0,
    lineHeight: "60px",      // vertical center
    textAlign: "center",     // horizontal center
    width: "100%",            // occupy full width of top bar
}

const mainContent = {
    height: 600, // fixed content height
    width: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
}
