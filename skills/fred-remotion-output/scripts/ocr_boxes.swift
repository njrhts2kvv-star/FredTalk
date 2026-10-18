// OCR helper for readability_audit.py. Usage: ocr_boxes <image> [<image> ...]
// Prints one JSON line per image: {"file":..., "width":W, "height":H, "boxes":[{"x","y","w","h","conf","text"}]}
// Pixel coordinates, origin top-left.
import Foundation
import Vision
import CoreGraphics
import ImageIO

func run(_ path: String) -> [String: Any] {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
        return ["file": path, "error": "cannot read", "boxes": []]
    }
    let W = Double(img.width), H = Double(img.height)
    var boxes: [[String: Any]] = []
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.usesLanguageCorrection = false
    req.recognitionLanguages = ["zh-Hans", "en-US"]
    req.minimumTextHeight = 0.0
    let handler = VNImageRequestHandler(cgImage: img, options: [:])
    do { try handler.perform([req]) } catch { return ["file": path, "error": "\(error)", "boxes": []] }
    for obs in req.results ?? [] {
        guard let cand = obs.topCandidates(1).first else { continue }
        let b = obs.boundingBox
        boxes.append(["x": b.minX * W, "y": (1 - b.maxY) * H, "w": b.width * W, "h": b.height * H,
                      "conf": Double(cand.confidence), "text": cand.string])
    }
    return ["file": path, "width": W, "height": H, "boxes": boxes]
}

for p in CommandLine.arguments.dropFirst() {
    let d = try! JSONSerialization.data(withJSONObject: run(p), options: [])
    print(String(data: d, encoding: .utf8)!)
}
