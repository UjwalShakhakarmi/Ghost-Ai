import type { CanvasEdge, CanvasNode, NodeShape } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

type HandlePosition = "top" | "right" | "bottom" | "left";

function createNode(
  id: string,
  label: string,
  shape: NodeShape,
  colorIndex: number,
  x: number,
  y: number,
  width = 160,
  height = 80
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: {
      label,
      shape,
      color: NODE_COLORS[colorIndex % NODE_COLORS.length].fill,
    },
  };
}

function createEdge(
  id: string,
  source: string,
  target: string,
  label?: string,
  sourceHandle: HandlePosition = "bottom",
  targetHandle: HandlePosition = "top"
): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    sourceHandle,
    targetHandle,
    data: label ? { label } : {},
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description:
      "API Gateway routing requests to isolated domain microservices, databases, and message queues.",
    nodes: [
      createNode("gw", "API Gateway", "pill", 1, 260, 40, 180, 70),
      createNode("auth", "Auth Service", "rectangle", 2, 40, 170, 160, 80),
      createNode("users", "User Service", "rectangle", 6, 260, 170, 160, 80),
      createNode("orders", "Order Service", "rectangle", 3, 480, 170, 160, 80),
      createNode("queue", "Kafka Event Queue", "hexagon", 5, 700, 160, 160, 100),
      createNode("redis", "Redis Cache", "circle", 4, 65, 310, 110, 110),
      createNode("user-db", "Users DB", "cylinder", 6, 270, 310, 140, 110),
      createNode("order-db", "Orders DB", "cylinder", 3, 490, 310, 140, 110),
    ],
    edges: [
      createEdge("e1", "gw", "auth", "/auth/*", "bottom", "top"),
      createEdge("e2", "gw", "users", "/users/*", "bottom", "top"),
      createEdge("e3", "gw", "orders", "/orders/*", "bottom", "top"),
      createEdge("e4", "users", "redis", "Cache", "bottom", "top"),
      createEdge("e5", "users", "user-db", "SQL", "bottom", "top"),
      createEdge("e6", "orders", "order-db", "SQL", "bottom", "top"),
      createEdge("e7", "orders", "queue", "OrderCreated", "right", "left"),
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Deployment Pipeline",
    description:
      "Automated build, test, package, and multi-stage deployment pipeline for cloud services.",
    nodes: [
      createNode("git", "Git Repository", "hexagon", 1, 40, 140, 150, 100),
      createNode("build", "Build Container", "rectangle", 2, 240, 150, 160, 80),
      createNode("test", "Test Suite", "diamond", 5, 450, 120, 140, 140),
      createNode("registry", "Docker Registry", "cylinder", 7, 640, 135, 140, 110),
      createNode("staging", "Staging Cluster", "pill", 6, 840, 70, 170, 70),
      createNode("prod", "Production Cluster", "pill", 3, 840, 210, 170, 70),
    ],
    edges: [
      createEdge("e1", "git", "build", "Git Push", "right", "left"),
      createEdge("e2", "build", "test", "Artifacts", "right", "left"),
      createEdge("e3", "test", "registry", "Pass & Push", "right", "left"),
      createEdge("e4", "registry", "staging", "Auto Deploy", "right", "left"),
      createEdge("e5", "registry", "prod", "Promote", "right", "left"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "Decoupled event producers publishing events to an Event Bus consumed asynchronously by workers.",
    nodes: [
      createNode("producer", "Web Producer", "pill", 1, 50, 160, 170, 70),
      createNode("bus", "Event Bus / Kafka", "hexagon", 2, 270, 145, 160, 100),
      createNode("worker-pay", "Payment Worker", "rectangle", 6, 480, 40, 160, 80),
      createNode("worker-email", "Email Worker", "rectangle", 5, 480, 160, 160, 80),
      createNode("worker-analytics", "Analytics Worker", "rectangle", 3, 480, 280, 160, 80),
      createNode("store", "Event Store", "cylinder", 7, 700, 145, 140, 110),
    ],
    edges: [
      createEdge("e1", "producer", "bus", "Publish Event", "right", "left"),
      createEdge("e2", "bus", "worker-pay", "PaymentCreated", "right", "left"),
      createEdge("e3", "bus", "worker-email", "UserSignedUp", "right", "left"),
      createEdge("e4", "bus", "worker-analytics", "PageVisited", "right", "left"),
      createEdge("e5", "worker-pay", "store", "Log Transaction", "right", "top"),
      createEdge("e6", "worker-email", "store", "Log Dispatch", "right", "left"),
      createEdge("e7", "worker-analytics", "store", "Save Metrics", "right", "bottom"),
    ],
  },
];
