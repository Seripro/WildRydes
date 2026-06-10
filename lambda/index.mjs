import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";

// DynamoDBクライアントの初期化
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// ユニコーンのリスト（この中からランダムに配車されます）
const fleet = [
  { Name: "Bucephalus", Color: "Golden", Gender: "Male" },
  { Name: "Shadowfax", Color: "White", Gender: "Male" },
  { Name: "Rocinante", Color: "Yellow", Gender: "Female" },
];

export const handler = async (event) => {
  // 認証情報がリクエストに含まれているかチェック
  if (!event.requestContext.authorizer) {
    return errorResponse(
      "Authorization not configured",
      event.requestContext.requestId,
    );
  }

  // 配車IDの生成と、リクエスト情報の取得
  const rideId = toUrlString(randomBytes(16));
  const username = event.requestContext.authorizer.claims["cognito:username"];
  const requestBody = JSON.parse(event.body);
  const pickupLocation = requestBody.PickupLocation;

  // ユニコーンをランダムに手配
  const unicorn = fleet[Math.floor(Math.random() * fleet.length)];

  try {
    // DynamoDBにデータを保存
    await recordRide(rideId, username, unicorn);

    // フロントエンドに成功レスポンスを返す
    return {
      statusCode: 201,
      body: JSON.stringify({
        RideId: rideId,
        Unicorn: unicorn,
        UnicornName: unicorn.Name,
        Eta: "30 seconds",
        Rider: username,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error(err);
    return errorResponse(err.message, event.requestContext.requestId);
  }
};

// DynamoDBへの書き込み処理
async function recordRide(rideId, username, unicorn) {
  return ddb.send(
    new PutCommand({
      TableName: "Rides",
      Item: {
        RideId: rideId,
        User: username,
        Unicorn: unicorn,
        UnicornName: unicorn.Name,
        RequestTime: new Date().toISOString(),
      },
    }),
  );
}

// ID生成用のユーティリティ関数
function toUrlString(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// エラー時のレスポンス生成関数
function errorResponse(errorMessage, awsRequestId) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
}
