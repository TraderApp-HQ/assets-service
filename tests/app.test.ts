import request from "supertest";

const app = "http://localhost:8000";

describe("Testing API endpoints", () => {
    describe("Pinging server", () => {
        it("should respong with pong", async () => {
            const res = await request(app).get("/api/v1/ping/").send();

            expect(res.status).toEqual(200);
            expect(res.body.message).toBe("pong");
        })
    })
});