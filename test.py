# %%
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
# %%
df1 = pd.read_csv('E:\MLAIDEV\csv_files\Bengaluru_House_Data.csv')
df1
# %%
df1.groupby('area_type')['area_type'].agg('count')
# %%
df2 = df1.drop(['area_type','society', 'balcony', 'availability'], axis='columns')
df2
# %%
df2.isnull().sum()
# %%
df3 = df2.dropna()
df3.isnull().sum()
# %%
df3['size'].unique()
# %%
df3['bhk'] = df3['size'].apply(lambda x: int(x.split(' ')[0]))
# %%
df3.head()
# %%
df3[df3.bhk>20]
# %%
def is_float(x):
    try:
        float(x)
    except:
        return False
    return True
# %%
df3[~(df3['total_sqft'].apply(is_float))]
# %%
df3.drop('size', axis='columns', inplace=True)
df3
# %%
def convert_range_to_num(x):
    token = x.split('-')
    if len(token)==2:
        return (float(token[0])+float(token[1]))/2
    try: 
        return float(x)
    except:
        return None
# %%
convert_range_to_num('2100 - 2850')
# %%
convert_range_to_num('2100')
# %%
df4 = df3.copy()
df4['total_sqft'] = df4['total_sqft'].apply(convert_range_to_num)
df4.head()
# %%
df4.loc[30]
# %%
df4['price_per_sqft'] = df4['price']*100000/df4['total_sqft']
df5 = df4.copy()
df5
# %%
len(df5['location'].unique())
df5.location = df5.location.apply(lambda x: x.strip())
location_stats = df5.groupby('location')['location'].agg('count').sort_values(ascending=False)
location_stats
len(location_stats[location_stats<=10])
location_stats_less_than_10 = location_stats[location_stats<=10]
df5['location'] = df5['location'].apply(lambda x : 'other' if x in location_stats_less_than_10 else x)
df5.head(15)
# %%
df5[df5['total_sqft']/df5['bhk']<300]
df6 = df5[~(df5['total_sqft']/df5['bhk']<300)]
df6.shape
df6.price_per_sqft.describe()
# %%
def remove_price_per_sqft_outliers(df):
    df_output = pd.DataFrame()
    for key, subdf in df.groupby('location'):
        avg = np.mean(subdf.price_per_sqft)
        st = np.std(subdf.price_per_sqft)
        reduced_df = subdf[(subdf.price_per_sqft > (avg-st)) & (subdf.price_per_sqft <= (avg+st))]
        df_output = pd.concat([df_output, reduced_df], ignore_index=True)
    return df_output
# %%
df7 = remove_price_per_sqft_outliers(df6)
df7['price_per_sqft'].describe()
# %%
import matplotlib
def plot_scatter_chart(df, location):
    bhk2 = df[(df.location==location) & (df.bhk==2)]
    bhk3 = df[(df.location==location) & (df.bhk==3)]
    # matplotlib.rcParams['figure.figsize'] = (15,10)
    plt.scatter(bhk2.total_sqft, bhk2.price, color='blue', marker='.', label = '2 BHK', s=50)
    plt.scatter(bhk3.total_sqft, bhk3.price, color='green', marker='+', label = '3 BHK', s=50)
    plt.legend()

plot_scatter_chart(df7, 'Hebbal')
# %%
def remove_bkh_outliers(df):
    exclude_indices = np.array([])
    for location , location_df in df.groupby('location'):
        bhk_stats = {}
        for bhk, bhk_df in location_df.groupby('bhk'):
            bhk_stats[bhk] = {
                'mean' : np.mean(bhk_df.price_per_sqft),
                'std' : np.std(bhk_df.price_per_sqft),
                'count':bhk_df.shape[0]
            }
        for bhk, bhk_df in location_df.groupby('bhk'):
            stats = bhk_stats.get(bhk-1)
            if stats and stats['count'] > 5:
                exclude_indices = np.append(exclude_indices, bhk_df[bhk_df.price_per_sqft < (stats['mean'])].index.values)

    return df.drop(exclude_indices, axis='index')

df8 = remove_bkh_outliers(df7)
df8.shape
# %%
plt.hist(df8.bath)
# %%
df9 = df8[~(df8.bath >= df8.bhk+2)]
df9
# %%
df10 = df9.drop('price_per_sqft', axis='columns')
df10
# %%
dummies = pd.get_dummies(df10['location'])
# %%
df11 = pd.concat([df10, dummies], axis='columns')
df11.head(3)
# %%
df11 = df11.drop('location', axis='columns')
df11.head(3)
# %%
df11 = df11.drop('other', axis='columns')
df11.head(3)
# %%
X = df11.drop('price', axis='columns')
X.head()
# %%
y = df11['price']
y
# %%
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=10)
# %%
from sklearn.linear_model import LinearRegression
lr_clf = LinearRegression()
lr_clf.fit(X_train, y_train)
lr_clf.score(X_test, y_test)
# %%
from sklearn.model_selection import ShuffleSplit
from sklearn.model_selection import cross_val_score

cv = ShuffleSplit(n_splits=5, test_size=0.2, random_state=0)
cross_val_score(LinearRegression(), X, y, cv = cv)
# %%
def predict_price(location, sqft, bath, bhk):
    location_index = np.where(X.columns==location)[0][0]
    x = np.zeros(len(X.columns))
    x[0] = sqft
    x[1] = bath
    x[2] = bhk
    if location_index>=0:
        x[location_index] = 1

    return lr_clf.predict([x])[0]
# %%
import pickle
with open('model.pickle', 'wb') as f:
    pickle.dump(lr_clf, f)
# %%
import json
columns = {
    'data_columns' : [col.lower() for col in X.columns]
}
with open("columns.json", "w") as f:
    f.write(json.dumps(columns))
# %%
