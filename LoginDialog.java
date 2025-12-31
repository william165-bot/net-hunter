package login.dialog.logindpmods;

import android.app.Dialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.AsyncTask;
import android.provider.Settings;
import android.text.method.PasswordTransformationMethod;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;
import android.util.Base64;

public class LoginDialog {
    private static final String ADMIN_KEY = "Cand40df5a@@@";
    private static final String PREFS_NAME = "LoginPrefs";
    private static final String GITHUB_OWNER = "william165-bot";
    private static final String GITHUB_REPO = "net-hunter";
    private static final String GITHUB_BRANCH = "main";
    private static final String DATA_PATH = "data/users";

    public static void show(Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences(PREFS_NAME, 0);
        if (sharedPreferences.getBoolean("logged_in", false) && sharedPreferences.getString("device_id", "").equals(getDeviceId(context))) {
            Toast.makeText(context, "Already logged in!", 0).show();
        } else {
            showLoginDialog(context);
        }
    }

    private static void showLoginDialog(final Context context) {
        final Dialog dialog = new Dialog(context);
        dialog.requestWindowFeature(1);
        dialog.setCancelable(false);
        LinearLayout linearLayout = new LinearLayout(context);
        linearLayout.setOrientation(1);
        linearLayout.setPadding(50, 50, 50, 50);
        linearLayout.setBackgroundColor(Color.parseColor("#1E1E1E"));
        TextView textView = new TextView(context);
        textView.setText("Authentication System");
        textView.setTextSize(24.0f);
        textView.setTextColor(-1);
        textView.setGravity(17);
        textView.setPadding(0, 0, 0, 30);
        linearLayout.addView(textView);
        final EditText createEditText = createEditText(context, "Username", false);
        linearLayout.addView(createEditText);
        final EditText createEditText2 = createEditText(context, "Password", true);
        linearLayout.addView(createEditText2);
        final CheckBox checkBox = new CheckBox(context);
        checkBox.setText("Remember Me");
        checkBox.setTextColor(-1);
        checkBox.setChecked(true);
        linearLayout.addView(checkBox);
        LinearLayout linearLayout2 = new LinearLayout(context);
        linearLayout2.setOrientation(0);
        linearLayout2.setGravity(17);
        linearLayout2.setPadding(0, 20, 0, 0);
        Button createButton = createButton(context, "Login");
        Button createButton2 = createButton(context, "Sign Up");
        Button createButton3 = createButton(context, "Admin");
        linearLayout2.addView(createButton);
        linearLayout2.addView(createButton2);
        linearLayout2.addView(createButton3);
        linearLayout.addView(linearLayout2);
        final TextView textView2 = new TextView(context);
        textView2.setTextColor(-256);
        textView2.setGravity(17);
        textView2.setPadding(0, 20, 0, 0);
        linearLayout.addView(textView2);
        createButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String trim = createEditText.getText().toString().trim();
                String trim2 = createEditText2.getText().toString().trim();
                if (trim.isEmpty() || trim2.isEmpty()) {
                    textView2.setText("Please fill all fields");
                } else {
                    textView2.setText("Authenticating...");
                    new AuthTask(context, trim, trim2, checkBox.isChecked(), textView2, dialog, false).execute(new Void[0]);
                }
            }
        });
        createButton2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                showSignupDialog(context);
            }
        });
        createButton3.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                showAdminKeyDialog(context);
            }
        });
        dialog.setContentView(linearLayout);
        dialog.getWindow().setLayout(-1, -2);
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(0));
        dialog.show();
    }

    private static void showSignupDialog(final Context context) {
        final Dialog dialog = new Dialog(context);
        dialog.requestWindowFeature(1);
        dialog.setCancelable(false);
        LinearLayout linearLayout = new LinearLayout(context);
        linearLayout.setOrientation(1);
        linearLayout.setPadding(50, 50, 50, 50);
        linearLayout.setBackgroundColor(Color.parseColor("#1E1E1E"));
        TextView textView = new TextView(context);
        textView.setText("Create Account");
        textView.setTextSize(24.0f);
        textView.setTextColor(-1);
        textView.setGravity(17);
        textView.setPadding(0, 0, 0, 30);
        linearLayout.addView(textView);
        final EditText createEditText = createEditText(context, "Username", false);
        final EditText createEditText2 = createEditText(context, "Password", true);
        final EditText createEditText3 = createEditText(context, "Confirm Password", true);
        linearLayout.addView(createEditText);
        linearLayout.addView(createEditText2);
        linearLayout.addView(createEditText3);
        LinearLayout linearLayout2 = new LinearLayout(context);
        linearLayout2.setOrientation(0);
        linearLayout2.setGravity(17);
        linearLayout2.setPadding(0, 20, 0, 0);
        Button createButton = createButton(context, "Register");
        Button createButton2 = createButton(context, "Back");
        linearLayout2.addView(createButton);
        linearLayout2.addView(createButton2);
        linearLayout.addView(linearLayout2);
        final TextView textView2 = new TextView(context);
        textView2.setTextColor(-256);
        textView2.setGravity(17);
        textView2.setPadding(0, 20, 0, 0);
        linearLayout.addView(textView2);
        createButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String trim = createEditText.getText().toString().trim();
                String trim2 = createEditText2.getText().toString().trim();
                String trim3 = createEditText3.getText().toString().trim();
                if (trim.isEmpty() || trim2.isEmpty() || trim3.isEmpty()) {
                    textView2.setText("Please fill all fields");
                    return;
                }
                if (!trim2.equals(trim3)) {
                    textView2.setText("Passwords do not match");
                } else if (trim2.length() < 4) {
                    textView2.setText("Password must be at least 4 characters");
                } else {
                    textView2.setText("Creating account...");
                    new AuthTask(context, trim, trim2, true, textView2, dialog, true).execute(new Void[0]);
                }
            }
        });
        createButton2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                showLoginDialog(context);
            }
        });
        dialog.setContentView(linearLayout);
        dialog.getWindow().setLayout(-1, -2);
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(0));
        dialog.show();
    }

    private static void showAdminKeyDialog(final Context context) {
        final Dialog dialog = new Dialog(context);
        dialog.requestWindowFeature(1);
        dialog.setCancelable(false);
        LinearLayout linearLayout = new LinearLayout(context);
        linearLayout.setOrientation(1);
        linearLayout.setPadding(50, 50, 50, 50);
        linearLayout.setBackgroundColor(Color.parseColor("#1E1E1E"));
        TextView textView = new TextView(context);
        textView.setText("Admin Access");
        textView.setTextSize(24.0f);
        textView.setTextColor(-1);
        textView.setGravity(17);
        textView.setPadding(0, 0, 0, 30);
        linearLayout.addView(textView);
        final EditText createEditText = createEditText(context, "Admin Key", true);
        linearLayout.addView(createEditText);
        LinearLayout linearLayout2 = new LinearLayout(context);
        linearLayout2.setOrientation(0);
        linearLayout2.setGravity(17);
        linearLayout2.setPadding(0, 20, 0, 0);
        Button createButton = createButton(context, "Verify");
        Button createButton2 = createButton(context, "Back");
        linearLayout2.addView(createButton);
        linearLayout2.addView(createButton2);
        linearLayout.addView(linearLayout2);
        final TextView textView2 = new TextView(context);
        textView2.setTextColor(-256);
        textView2.setGravity(17);
        textView2.setPadding(0, 20, 0, 0);
        linearLayout.addView(textView2);
        createButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (createEditText.getText().toString().trim().equals(ADMIN_KEY)) {
                    dialog.dismiss();
                    showAdminPanel(context);
                } else {
                    textView2.setText("Invalid admin key");
                }
            }
        });
        createButton2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                showLoginDialog(context);
            }
        });
        dialog.setContentView(linearLayout);
        dialog.getWindow().setLayout(-1, -2);
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(0));
        dialog.show();
    }

    private static void showAdminPanel(final Context context) {
        final Dialog dialog = new Dialog(context);
        dialog.requestWindowFeature(1);
        LinearLayout linearLayout = new LinearLayout(context);
        linearLayout.setOrientation(1);
        linearLayout.setPadding(30, 30, 30, 30);
        linearLayout.setBackgroundColor(Color.parseColor("#1E1E1E"));
        TextView textView = new TextView(context);
        textView.setText("Admin Panel - User Management");
        textView.setTextSize(20.0f);
        textView.setTextColor(-1);
        textView.setGravity(17);
        textView.setPadding(0, 0, 0, 20);
        linearLayout.addView(textView);
        ScrollView scrollView = new ScrollView(context);
        final LinearLayout linearLayout2 = new LinearLayout(context);
        linearLayout2.setOrientation(1);
        scrollView.addView(linearLayout2);
        linearLayout.addView(scrollView, new LinearLayout.LayoutParams(-1, 600));
        Button createButton = createButton(context, "Refresh");
        Button createButton2 = createButton(context, "Close");
        LinearLayout linearLayout3 = new LinearLayout(context);
        linearLayout3.setOrientation(0);
        linearLayout3.setGravity(17);
        linearLayout3.setPadding(0, 20, 0, 0);
        linearLayout3.addView(createButton);
        linearLayout3.addView(createButton2);
        linearLayout.addView(linearLayout3);
        createButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                loadUsers(context, linearLayout2, dialog);
            }
        });
        createButton2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dialog.dismiss();
                showLoginDialog(context);
            }
        });
        dialog.setContentView(linearLayout);
        dialog.getWindow().setLayout(-1, -1);
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(0));
        dialog.show();
        loadUsers(context, linearLayout2, dialog);
    }

    private static void loadUsers(final Context context, final LinearLayout linearLayout, final Dialog dialog) {
        new AsyncTask<Void, Void, JSONArray>() {
            @Override
            protected JSONArray doInBackground(Void... voidArr) {
                try {
                    String url = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + DATA_PATH;
                    HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                    conn.setRequestMethod("GET");
                    conn.setRequestProperty("Accept", "application/vnd.github.v3+json");
                    
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    return new JSONArray(response.toString());
                } catch (Exception e) {
                    return null;
                }
            }

            @Override
            protected void onPostExecute(JSONArray files) {
                linearLayout.removeAllViews();
                if (files == null) {
                    TextView textView = new TextView(context);
                    textView.setText("Failed to load users");
                    textView.setTextColor(-65536);
                    linearLayout.addView(textView);
                    return;
                }
                try {
                    if (files.length() == 0) {
                        TextView textView2 = new TextView(context);
                        textView2.setText("No users registered");
                        textView2.setTextColor(-7829368);
                        linearLayout.addView(textView2);
                        return;
                    }
                    for (int i = 0; i < files.length(); i++) {
                        JSONObject fileObj = files.getJSONObject(i);
                        String fileName = fileObj.getString("name");
                        if (fileName.endsWith(".json")) {
                            String deviceId = fileName.replace(".json", "");
                            loadUserDetails(context, linearLayout, deviceId, fileObj.getString("download_url"), dialog);
                        }
                    }
                } catch (Exception e) {
                    TextView textView3 = new TextView(context);
                    textView3.setText("Error parsing users: " + e.getMessage());
                    textView3.setTextColor(-65536);
                    linearLayout.addView(textView3);
                }
            }
        }.execute(new Void[0]);
    }

    private static void loadUserDetails(final Context context, final LinearLayout linearLayout, final String deviceId, String downloadUrl, final Dialog dialog) {
        new AsyncTask<String, Void, JSONObject>() {
            @Override
            protected JSONObject doInBackground(String... urls) {
                try {
                    HttpURLConnection conn = (HttpURLConnection) new URL(urls[0]).openConnection();
                    conn.setRequestMethod("GET");
                    
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    return new JSONObject(response.toString());
                } catch (Exception e) {
                    return null;
                }
            }

            @Override
            protected void onPostExecute(JSONObject userData) {
                if (userData != null) {
                    addUserCard(context, linearLayout, deviceId, userData, dialog);
                }
            }
        }.execute(downloadUrl);
    }

    private static void addUserCard(final Context context, final LinearLayout linearLayout, final String str, final JSONObject jSONObject, final Dialog dialog) {
        try {
            LinearLayout linearLayout2 = new LinearLayout(context);
            linearLayout2.setOrientation(1);
            linearLayout2.setBackgroundColor(Color.parseColor("#2D2D2D"));
            linearLayout2.setPadding(20, 20, 20, 20);
            LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(-1, -2);
            layoutParams.setMargins(0, 0, 0, 15);
            linearLayout2.setLayoutParams(layoutParams);
            TextView textView = new TextView(context);
            textView.setText("Username: " + jSONObject.getString("username"));
            textView.setTextColor(-1);
            textView.setTextSize(16.0f);
            linearLayout2.addView(textView);
            TextView textView2 = new TextView(context);
            textView2.setText("Device ID: " + str);
            textView2.setTextColor(-7829368);
            textView2.setTextSize(12.0f);
            linearLayout2.addView(textView2);
            TextView textView3 = new TextView(context);
            textView3.setText("Expires: " + jSONObject.getString("expiresAt"));
            textView3.setTextColor(-7829368);
            textView3.setTextSize(12.0f);
            linearLayout2.addView(textView3);
            final boolean optBoolean = jSONObject.optBoolean("revoked", false);
            TextView textView4 = new TextView(context);
            textView4.setText("Status: " + (optBoolean ? "REVOKED" : "ACTIVE"));
            textView4.setTextColor(optBoolean ? -65536 : -16711936);
            textView4.setTextSize(14.0f);
            linearLayout2.addView(textView4);
            LinearLayout linearLayout3 = new LinearLayout(context);
            linearLayout3.setOrientation(0);
            linearLayout3.setGravity(17);
            linearLayout3.setPadding(0, 10, 0, 0);
            Button button = new Button(context);
            button.setText(optBoolean ? "Activate" : "Revoke");
            button.setBackgroundColor(Color.parseColor(optBoolean ? "#4CAF50" : "#F44336"));
            button.setTextColor(-1);
            button.setPadding(20, 10, 20, 10);
            Button button2 = new Button(context);
            button2.setText("Delete");
            button2.setBackgroundColor(Color.parseColor("#FF5722"));
            button2.setTextColor(-1);
            button2.setPadding(20, 10, 20, 10);
            linearLayout3.addView(button);
            linearLayout3.addView(button2);
            linearLayout2.addView(linearLayout3);
            button.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    try {
                        jSONObject.put("revoked", !optBoolean);
                        updateUser(context, str, jSONObject.toString(), new Runnable() {
                            @Override
                            public void run() {
                                loadUsers(context, linearLayout, dialog);
                            }
                        });
                    } catch (Exception e) {
                        Toast.makeText(context, "Error: " + e.getMessage(), 0).show();
                    }
                }
            });
            button2.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    deleteUser(context, str, new Runnable() {
                        @Override
                        public void run() {
                            loadUsers(context, linearLayout, dialog);
                        }
                    });
                }
            });
            linearLayout.addView(linearLayout2);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void updateUser(final Context context, final String deviceId, final String userData, final Runnable runnable) {
        new AsyncTask<Void, Void, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... voidArr) {
                try {
                    String filePath = DATA_PATH + "/" + deviceId + ".json";
                    String getShaUrl = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + filePath;
                    
                    HttpURLConnection connGet = (HttpURLConnection) new URL(getShaUrl).openConnection();
                    connGet.setRequestMethod("GET");
                    connGet.setRequestProperty("Accept", "application/vnd.github.v3+json");
                    
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connGet.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    
                    JSONObject fileInfo = new JSONObject(response.toString());
                    String sha = fileInfo.getString("sha");
                    
                    String updateUrl = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + filePath;
                    HttpURLConnection connPut = (HttpURLConnection) new URL(updateUrl).openConnection();
                    connPut.setRequestMethod("PUT");
                    connPut.setRequestProperty("Content-Type", "application/json");
                    connPut.setRequestProperty("Accept", "application/vnd.github.v3+json");
                    connPut.setDoOutput(true);
                    
                    String encodedContent = Base64.encodeToString(userData.getBytes(), Base64.NO_WRAP);
                    
                    JSONObject putData = new JSONObject();
                    putData.put("message", "Update user " + deviceId);
                    putData.put("content", encodedContent);
                    putData.put("sha", sha);
                    putData.put("branch", GITHUB_BRANCH);
                    
                    OutputStream os = connPut.getOutputStream();
                    os.write(putData.toString().getBytes());
                    os.flush();
                    os.close();
                    
                    return connPut.getResponseCode() == 200;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            protected void onPostExecute(Boolean success) {
                if (success) {
                    Toast.makeText(context, "User updated", 0).show();
                    runnable.run();
                } else {
                    Toast.makeText(context, "Update failed", 0).show();
                }
            }
        }.execute(new Void[0]);
    }

    private static void deleteUser(final Context context, final String deviceId, final Runnable runnable) {
        new AsyncTask<Void, Void, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... voidArr) {
                try {
                    String filePath = DATA_PATH + "/" + deviceId + ".json";
                    String getShaUrl = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + filePath;
                    
                    HttpURLConnection connGet = (HttpURLConnection) new URL(getShaUrl).openConnection();
                    connGet.setRequestMethod("GET");
                    connGet.setRequestProperty("Accept", "application/vnd.github.v3+json");
                    
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connGet.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    
                    JSONObject fileInfo = new JSONObject(response.toString());
                    String sha = fileInfo.getString("sha");
                    
                    String deleteUrl = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + filePath;
                    HttpURLConnection connDelete = (HttpURLConnection) new URL(deleteUrl).openConnection();
                    connDelete.setRequestMethod("DELETE");
                    connDelete.setRequestProperty("Content-Type", "application/json");
                    connDelete.setRequestProperty("Accept", "application/vnd.github.v3+json");
                    connDelete.setDoOutput(true);
                    
                    JSONObject deleteData = new JSONObject();
                    deleteData.put("message", "Delete user " + deviceId);
                    deleteData.put("sha", sha);
                    deleteData.put("branch", GITHUB_BRANCH);
                    
                    OutputStream os = connDelete.getOutputStream();
                    os.write(deleteData.toString().getBytes());
                    os.flush();
                    os.close();
                    
                    return connDelete.getResponseCode() == 200;
                } catch (Exception e) {
                    return false;
                }
            }

            @Override
            protected void onPostExecute(Boolean success) {
                if (success) {
                    Toast.makeText(context, "User deleted", 0).show();
                    runnable.run();
                } else {
                    Toast.makeText(context, "Delete failed", 0).show();
                }
            }
        }.execute(new Void[0]);
    }

    private static EditText createEditText(Context context, String str, boolean z) {
        EditText editText = new EditText(context);
        editText.setHint(str);
        editText.setTextColor(-1);
        editText.setHintTextColor(-7829368);
        editText.setBackgroundColor(Color.parseColor("#2D2D2D"));
        editText.setPadding(30, 30, 30, 30);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(-1, -2);
        layoutParams.setMargins(0, 10, 0, 10);
        editText.setLayoutParams(layoutParams);
        if (z) {
            editText.setInputType(129);
            editText.setTransformationMethod(PasswordTransformationMethod.getInstance());
        }
        return editText;
    }

    private static Button createButton(Context context, String str) {
        Button button = new Button(context);
        button.setText(str);
        button.setTextColor(-1);
        button.setBackgroundColor(Color.parseColor("#2196F3"));
        button.setPadding(40, 20, 40, 20);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(-2, -2);
        layoutParams.setMargins(10, 0, 10, 0);
        button.setLayoutParams(layoutParams);
        return button;
    }

    private static String getDeviceId(Context context) {
        return Settings.Secure.getString(context.getContentResolver(), "android_id");
    }

    static class AuthTask extends AsyncTask<Void, Void, String> {
        private Context context;
        private Dialog dialog;
        private boolean isSignup;
        private String password;
        private boolean rememberMe;
        private TextView statusText;
        private String username;

        AuthTask(Context context, String str, String str2, boolean z, TextView textView, Dialog dialog, boolean z2) {
            this.context = context;
            this.username = str;
            this.password = str2;
            this.rememberMe = z;
            this.statusText = textView;
            this.dialog = dialog;
            this.isSignup = z2;
        }

        @Override
        protected String doInBackground(Void... voidArr) {
            try {
                String deviceId = getDeviceId(this.context);
                if (this.isSignup) {
                    return performSignup(deviceId);
                }
                return performLogin(deviceId);
            } catch (Exception e) {
                return "ERROR:" + e.getMessage();
            }
        }

        private String performSignup(String deviceId) throws Exception {
            String filePath = DATA_PATH + "/" + deviceId + ".json";
            String checkUrl = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + filePath;
            
            try {
                HttpURLConnection connCheck = (HttpURLConnection) new URL(checkUrl).openConnection();
                connCheck.setRequestMethod("GET");
                connCheck.setRequestProperty("Accept", "application/vnd.github.v3+json");
                
                if (connCheck.getResponseCode() == 200) {
                    return "ERROR:Device already registered";
                }
            } catch (Exception e) {
            }
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date expiryDate = new Date(System.currentTimeMillis() + 31536000000L);
            
            JSONObject userData = new JSONObject();
            userData.put("username", this.username);
            userData.put("password", this.password);
            userData.put("expiresAt", dateFormat.format(expiryDate));
            userData.put("allowOffline", true);
            userData.put("revoked", false);
            userData.put("createdAt", dateFormat.format(new Date()));
            
            String createUrl = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + filePath;
            HttpURLConnection connCreate = (HttpURLConnection) new URL(createUrl).openConnection();
            connCreate.setRequestMethod("PUT");
            connCreate.setRequestProperty("Content-Type", "application/json");
            connCreate.setRequestProperty("Accept", "application/vnd.github.v3+json");
            connCreate.setDoOutput(true);
            
            String encodedContent = Base64.encodeToString(userData.toString().getBytes(), Base64.NO_WRAP);
            
            JSONObject putData = new JSONObject();
            putData.put("message", "Create user " + deviceId);
            putData.put("content", encodedContent);
            putData.put("branch", GITHUB_BRANCH);
            
            OutputStream os = connCreate.getOutputStream();
            os.write(putData.toString().getBytes());
            os.flush();
            os.close();
            
            if (connCreate.getResponseCode() == 201) {
                return "SUCCESS:Account created successfully";
            }
            return "ERROR:Failed to create account";
        }

        private String performLogin(String deviceId) throws Exception {
            String filePath = DATA_PATH + "/" + deviceId + ".json";
            String getUrl = "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + filePath;
            
            HttpURLConnection conn = (HttpURLConnection) new URL(getUrl).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/vnd.github.v3+json");
            
            if (conn.getResponseCode() != 200) {
                return "ERROR:User not found. Please sign up first.";
            }
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();
            
            JSONObject fileInfo = new JSONObject(response.toString());
            String content = fileInfo.getString("content");
            String decodedContent = new String(Base64.decode(content, Base64.DEFAULT));
            
            JSONObject userData = new JSONObject(decodedContent);
            
            if (userData.optBoolean("revoked", false)) {
                return "ERROR:Account has been revoked";
            }
            if (!userData.getString("username").equals(this.username)) {
                return "ERROR:Invalid username";
            }
            if (!userData.getString("password").equals(this.password)) {
                return "ERROR:Invalid password";
            }
            
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            if (dateFormat.parse(userData.getString("expiresAt")).before(new Date())) {
                return "ERROR:Account expired";
            }
            
            return "SUCCESS:Login successful";
        }

        @Override
        protected void onPostExecute(String str) {
            if (str.startsWith("SUCCESS:")) {
                Toast.makeText(this.context, str.substring(8), 1).show();
                if (this.rememberMe) {
                    this.context.getSharedPreferences(PREFS_NAME, 0).edit().putBoolean("logged_in", true).putString("device_id", getDeviceId(this.context)).putString("username", this.username).apply();
                }
                this.dialog.dismiss();
                return;
            }
            if (str.startsWith("ERROR:")) {
                this.statusText.setText(str.substring(6));
                this.statusText.setTextColor(-65536);
            }
        }
    }
}
